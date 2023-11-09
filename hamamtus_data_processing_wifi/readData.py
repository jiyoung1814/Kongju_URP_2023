measurement_time =6

import CreateBlankDic

class readData:

    def __init__(self, files):
        IntgIdex = 1
        Pixle_Zero_Index = 4
        PixelNum = 288

        self.data = CreateBlankDic.createBlankDic(['Intg.']+ list(range(0,288)))

        for exposure in files:
            # ['Intg', 'pixel0', 'pixel1', ... ,'pixel287']
            if exposure.split('.')[1] == 'txt':
                with open(exposure, "r") as f:
                    lines = f.readlines()

                    line = removeBlank(lines)  # \n이나 \t 제거

                    # Intag.
                    self.data[line[IntgIdex].split()[0]] = self.data[line[IntgIdex].split()[0]] + [line[IntgIdex].split()[2]]
                    # 픽셀
                    for i in range(Pixle_Zero_Index, (Pixle_Zero_Index + PixelNum)):
                        self.data[int(line[i].split()[0])] = self.data[int(line[i].split()[0])] + [int(line[i].split()[1])]


def removeBlank(lines):
    line = []
    for l in lines:
        line.append(l.replace("\n", '').replace('\t', ' '))
    return line
