import colour

class Color:

    def __init__(self, data_list):

        data = make_dic(data_list)

        sd = colour.SpectralDistribution(data)

        XYZ = colour.sd_to_XYZ(sd)
        # print("XYZ: " + str(XYZ[0]) + "\t" + str(XYZ[1]) + "\t" + str(XYZ[2]))

        xy = colour.XYZ_to_xy(XYZ)
        # print("xy: " + str(xy[0]) + "\t" + str(xy[1]))

        cct = colour.xy_to_CCT(xy, "McCamy 1992")
        # print("cct: " + str(cct))

        self.color_data = [XYZ[1], cct]
        # self.color_data = [0,0]


def make_dic(data_list):
    dic = {}
    cnt = 0
    for i in range(380,781):
        dic[i] = data_list[cnt]
        cnt += 1
    return dic