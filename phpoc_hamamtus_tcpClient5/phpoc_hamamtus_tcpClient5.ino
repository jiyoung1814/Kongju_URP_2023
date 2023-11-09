#include <Phpoc.h>
#include <elapsedMillis.h>

#define SPEC_TRG         A0
#define SPEC_ST          A1
#define SPEC_CLK         A2
#define SPEC_VIDEO       A3
#define WHITE_LED        A4
#define LASER_404        A5
#define MY_DEVICE_ID     1
#define SPEC_CHANNELS    288

int data[SPEC_CHANNELS];
byte STX;
byte DEVID;
char CMD;
long INTG;
long SATURATION = 100;
byte ETX;

long   integartion_ms = 0;
long   min_integ_micros = 0;

PhpocClient client;
IPAddress hostIp(210,102,142,20);
int ServerPort = 9999;

void initValues() {
  STX = 0;
  DEVID = 0;
  CMD = 0;
  INTG = 0;
  SATURATION = 100;
  ETX = 0;
  for(int i = 0;i< SPEC_CHANNELS;i++){
    data[i] = 0;
  }
}

//----------------------hamamtus function----------------------

inline void Delay100ns(){
  delayMicroseconds(0.1);
}
void measure_min_integ_micros() {
  //48 clock cycles are required after ST goes low
  elapsedMicros sinceStart_micros = 0;
  pulse_clock(48);
  min_integ_micros = sinceStart_micros;
}
inline void pulse_clock(long cycles){
  for(int i = 0; i < cycles; i++){
    digitalWrite(SPEC_CLK, HIGH);
    Delay100ns();
    digitalWrite(SPEC_CLK, LOW);
    Delay100ns();
  }
}
inline void pulse_clock_timed(long duration_micros){
  elapsedMicros sinceStart_micros = 0;
  while (sinceStart_micros < duration_micros){
    digitalWrite(SPEC_CLK, HIGH);
    Delay100ns();
    digitalWrite(SPEC_CLK, LOW);
    Delay100ns();
  }
}

void setIntegrationTime(long ms){
  integartion_ms = ms;
  integartion_ms -= min_integ_micros;
  integartion_ms = max(integartion_ms, 0);

  digitalWrite(SPEC_CLK, LOW);
  Delay100ns();
  digitalWrite(SPEC_CLK, HIGH);
  digitalWrite(SPEC_ST, HIGH);
  Delay100ns();
  digitalWrite(SPEC_CLK, LOW);

  pulse_clock(3);

  pulse_clock_timed(integartion_ms);

  digitalWrite(SPEC_ST, LOW);

  pulse_clock(87);
}

void readSPD(){
  for (int i = 0; i < SPEC_CHANNELS; i++)
  {
    pulse_clock(1);
    int readIntensity = analogRead(SPEC_VIDEO);
    data[i] = readIntensity > 1000 ? 1000 : readIntensity;
  }
}

void measureLightSource(long integration_time) {
  setIntegrationTime(integration_time);
  readSPD();
}

long autoIntegrationTime(long integration_time) {
  long inttime = integration_time;

  int pct = SATURATION;

  float persentage = 1;
  float MAX = 1000*persentage;
  float MIN = 1000*(persentage-0.1);
  int max = 0;
  while (1)
  {
    if (!(inttime > 380 && inttime <= 1000000)){
      Serial.println("saturation");
      for(int i = 0; i < SPEC_CHANNELS; i++)
        data[i] = 0;
      break;
    }
    measureLightSource(inttime);
    
    max = 0;  // 가장 큰 값이...
    for (int i = 0; i < 288; i++)
      if (max < data[i])
        max = data[i];
//    Serial.print("max: "); Serial.print(max);
//    Serial.print("  inttime: "); Serial.print(inttime);
    if (max < MIN) {  // (saturation-10)% 보다 작으면 1.05배...
//      Serial.println("__up");
      inttime *= 1.05;
    } else if (max >= MAX) { // saturation% 보다 크면 0.95배...
      inttime *= 0.95;
//      Serial.println("__down");
    }
    else {
//      Serial.println("__stop");
      break;
    }
  }

  return inttime;
}

/*
   8 바이트를 수신하고
   파싱하여 전역변수에 저장하고 (노출시간이 정상범위가 아니라면 1000으로 설정)
   정상 패킷인지 아닌지 확인하여 true 혹은 false를 반환
*/

boolean readTCPpacket(int pCnt ,char receive[]) {
  if(pCnt == 8){ //정상 패킷 길이 확인
    byte stx = receive[0];
    byte devid = receive[1];
    char cmd = receive[2];
    long intg = (((long)receive[3] & 0xFF) << 24) + (((long)receive[4] & 0xFF) << 16) + (((long)receive[5] & 0xFF) << 8) + ((long)receive[6] & 0xFF);
    byte etx = receive[7];

    if(!(intg >= 11 && intg <= 1000000)){
      intg = 1000; // integration time 이 11 ~ 1000000이 아니라면 1000으로 셋팅
    }

    if (stx == 0x02 && etx == 0x03 && devid == MY_DEVICE_ID){
      // 정상 패킷이라면
      STX = stx;
      CMD = cmd;
      INTG = intg;
      ETX = etx;
      return true;
    }
  }
  return false;
}

void writePacket(char cmd, long integration_time) {

  String packet = "";
  //stx
  packet += "02";
  //deviceid
  char myID[2];
  sprintf(myID, "%02d", MY_DEVICE_ID);
  packet += myID;
  //cmd
  packet += String(cmd, HEX);
  //intgtime
  String intgtime = String(integration_time, HEX);
  for(int i=0;i<8-intgtime.length();i++){
    packet += "0";
  }
  packet += intgtime;
  client.print(packet);
  client.flush();
  packet = "";
  
  for (int i = 0; i < SPEC_CHANNELS; i++){
    String val = String(data[i], HEX);
    int diff = 4-val.length();
    for(int j = 0; j<diff;j++){
      packet += "0";
//      Serial.print('0');
    }
    packet += val;
//    Serial.print(val);
    
    if(i % 32 == 31){
      client.print(packet);
      client.flush();
      packet = "";
//      Serial.println();
    }
  }
  packet ="03";
  client.print(packet);
  client.flush();
}


void setup() {
  Serial.begin(9600);
  while(!Serial);
  
  // initialize PHPoC [WiFi] Shield:
  Phpoc.begin(PF_LOG_SPI | PF_LOG_NET);

  //tcp 서버와 연결
  client.connect(hostIp, ServerPort);

//----------------------hamamtus setup----------------------
  pinMode(SPEC_CLK, OUTPUT);
  pinMode(SPEC_ST, OUTPUT);
  pinMode(LASER_404, OUTPUT);
  pinMode(WHITE_LED, OUTPUT);

  digitalWrite(SPEC_CLK, LOW);
  digitalWrite(SPEC_ST, LOW);
    
  initValues();
  measure_min_integ_micros();
}

int cnt = 0;
char receive[8];
void loop() {

  if(client.connected()){
    if(client.available()){
      int pCnt = client.readBytes(receive, 8);
      if(readTCPpacket(8, receive)){
        Serial.print("cmd:");Serial.println(CMD);
        if(CMD == 'A'){
          long inttime = autoIntegrationTime(INTG);
          Serial.print("intgtime:");Serial.println(inttime);
//          if(data[0] != -1){
          writePacket(CMD, inttime); 
//          }
        }
        else if(CMD == 'M'){
          long inttime = INTG;
          measureLightSource(inttime);
          Serial.print("intgtime:");Serial.println(inttime);
          writePacket(CMD, inttime);
        }
        initValues();
      }
    }
  }

  else{
    Serial.println("TCP Connection host fail");
    client.stop();

    //재연결
    while(!client.connected()){
      Serial.println("Reconnetting");
      client.connect(hostIp, ServerPort);
    }
  }
}
