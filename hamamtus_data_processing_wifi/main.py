import Read_Cas_Data
import readData
import GetMergedSPD
import RemoveDarkCurrent
import Leveling_data
import Lagrange_interpolation
import Y_interpolation

from flask import Flask, jsonify, request
import colour

import DrawEachExel
import Color
from openpyxl import Workbook
import pandas as pd


app = Flask(__name__)
portNum = 9000
cas_data = {}
optical = {}

@app.route('/color/getOptical', methods=['POST'])
def getPixel():

    pixel = request.json

    # print(pixel)
    data = getSPD(pixel)

    res = jsonify(data)
    res.status_code = 200



    return res

def getSPD(pixel):
    data = pixel # {pixel:{'0': int(spd) ... '287': int(spd)}, intgtime: 1000}

    # # merged_data = GetMergedSPD.GetMergedSPD(data).merged_data # {0: [spd, intg] ... 287:[]}

    lagrange_data = Lagrange_interpolation.Lagrange_interpolation(data, cas_data).lagrange_data  # {0: spd ... 287: spd}
    remove_dark_current_data = RemoveDarkCurrent.RemoveDarkCurrent(lagrange_data, data['intgtime']).dark_current_removed_data  # {0: spd ... 287: spd}
    leveling_data = Leveling_data.Leveling_data(remove_dark_current_data, data['intgtime']).leveling_data # {0: spd ... 287: spd}
    y_interpolation_data = Y_interpolation.Y_interpolation(leveling_data, 0.7).y_interpolation_data  # {380: spd, ... 780:spd}

    # leveling_data = Leveling_data.Leveling_data(remove_dark_current_data).leveling_data # {0: [spd, intg] ... 287:[]}
    #
    # # lagrange_data = Lagrange_interpolation.Lagrange_interpolation(remove_dark_current_data, cas_data).lagrange_data  # {cas: [spd(380)...spd(780)], hamamatus: []}
    # y_interpolation_data = Y_interpolation.Y_interpolation(lagrange_data['hamamtus']).y_interpolation_data #{380: spd, ... 780:spd}
    #

    ##광특성 추출
    # calibrated = getOptical(y_interpolation_data) #{spd:{}, cri:{},cqs:{}, cct, XYZ, xyz}

    final_data = {}
    # final_data['calibrated'] = calibrated
    final_data['lagrange'] = lagrange_data
    final_data['remove_dark_current'] = remove_dark_current_data
    final_data['leveling'] = leveling_data


    return final_data

def getOptical(spd):
    data = {}

    sd = colour.SpectralDistribution(spd)
    data['spd'] = spd

    data['XYZ'] = getXYZ(sd)
    data['xyz'] = getxyz(sd)

    data['CCT'] = getCCT(sd)
    data['lux'] = getLux(sd)

    data['CRI'] = getCRI(sd)
    data['CQS'] = getCQS(sd)


    return data


def getXYZ(sd):
    # cmfs = colour.MSDS_CMFS['CIE 1931 2 Degree Standard Observer']
    # illuminant = colour.SDS_ILLUMINANTS['D65']
    XYZ = colour.sd_to_XYZ(sd)
    df_XYZ={}
    df_XYZ['X'] = XYZ[0]
    df_XYZ['Y'] = XYZ[1]
    df_XYZ['Z'] = XYZ[2]
    return df_XYZ
    # return [Tristimulus for Tristimulus in XYZ.tolist()]


def getxyz(sd):
    XYZ = getXYZ(sd)
    xy = colour.XYZ_to_xy([XYZ['X'],XYZ['Y'], XYZ['Z']])
    xyz = [xy[0], xy[1], (1 - xy[0] - xy[1])]
    xyz = {
        'x': xy[0],
        'y': xy[1],
        'z': (1 - xy[0] - xy[1])
    }
    return xyz


def getCCT(sd):
    xyz = getxyz(sd)
    cct = colour.xy_to_CCT([xyz['x'], xyz['y']], "McCamy 1992")
    return cct


def getLux(sd):
    XYZ = getXYZ(sd)
    lux = XYZ['Y']
    return lux


def getCRI(sd):
    cri_all = colour.colour_rendering_index(sd, additional_data=True)
    cri = {
        "ra": cri_all.Q_a,
        "r01": cri_all.Q_as[1].Q_a,
        "r02": cri_all.Q_as[2].Q_a,
        "r03": cri_all.Q_as[3].Q_a,
        "r04": cri_all.Q_as[4].Q_a,
        "r05": cri_all.Q_as[5].Q_a,
        "r06": cri_all.Q_as[6].Q_a,
        "r07": cri_all.Q_as[7].Q_a,
        "r08": cri_all.Q_as[8].Q_a,
        "r09": cri_all.Q_as[9].Q_a,
        "r10": cri_all.Q_as[10].Q_a,
        "r11": cri_all.Q_as[11].Q_a,
        "r12": cri_all.Q_as[12].Q_a,
        "r13": cri_all.Q_as[13].Q_a,
        "r14": cri_all.Q_as[14].Q_a,
    }
    return cri


def getCQS(sd):
    cqs_all = colour.colour_quality_scale(sd, additional_data=True)
    cqs = {
        "vsa": cqs_all.Q_a,
        "vs01": cqs_all.Q_as[1].Q_a,
        "vs02": cqs_all.Q_as[2].Q_a,
        "vs03": cqs_all.Q_as[3].Q_a,
        "vs04": cqs_all.Q_as[4].Q_a,
        "vs05": cqs_all.Q_as[5].Q_a,
        "vs06": cqs_all.Q_as[6].Q_a,
        "vs07": cqs_all.Q_as[7].Q_a,
        "vs08": cqs_all.Q_as[8].Q_a,
        "vs09": cqs_all.Q_as[9].Q_a,
        "vs10": cqs_all.Q_as[10].Q_a,
        "vs11": cqs_all.Q_as[11].Q_a,
        "vs12": cqs_all.Q_as[12].Q_a,
        "vs13": cqs_all.Q_as[13].Q_a,
        "vs14": cqs_all.Q_as[14].Q_a,
        "vs15": cqs_all.Q_as[15].Q_a
    }
    return cqs

if __name__ == '__main__':
    cas_file_name = "2700K"
    cas_data = Read_Cas_Data.Read_Cas_Data(cas_file_name).cas_data  #{199: string(spd) ... 813:string(spd)}

    app.run(port=portNum)








