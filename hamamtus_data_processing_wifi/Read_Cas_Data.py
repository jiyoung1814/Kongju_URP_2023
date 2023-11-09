import CreateBlankDic

path_cas = "C:/Users/WITLAB/PycharmProjects/hamamtus_data_processing_wifi/data_cas/"
# path_cas = "/data_cas/"

class Read_Cas_Data:

    def __init__(self, cct):
        self.cas_data ={}

        with open(path_cas+cct+'.ISD', "r", encoding='UTF8') as f:
            lines = f.readlines()

            line = removeBlank(lines)

            start = line.index('[Data]')+10
            end = len(line)-2

            for i in range(start,end+1):
                sp_data = line[i].split()
                self.cas_data[sp_data[0]] = sp_data[1]



def removeBlank(lines):
    line = []
    for l in lines:
        line.append(l.replace("\n", '').replace('\t', ' '))
    return line