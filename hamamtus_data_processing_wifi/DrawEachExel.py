import pandas as pd
class DrawEachExel:

    def __init__(self, cct, t, data, merged_data, remove_dark_current_data, leveling_data, lagrange_data, y_interpolation_data):

        exel_name = cct+"_"+t+".xlsx"
        print(exel_name)

        cols_pixel = ['Intg', 'merged_spd', 'remove_dark', 'leveling']

        dt_raw = {}
        for i in range(len(data['Intg.'])):
            dt_raw[data['Intg.'][i]] = [temp[i] for temp in list(data.values())[1:len(data.values())]]
        df_raw = pd.DataFrame(dt_raw)

        dt_merge ={}
        dt_merge['merged_spd'] = [temp[0] for temp in list(merged_data.values())]
        dt_merge['remove_dark'] = [temp[0] for temp in list(remove_dark_current_data.values())]
        dt_merge['leveling'] = [temp[0] for temp in list(leveling_data.values())]
        df_merge = pd.DataFrame(dt_merge)

        dt_interpolation ={}
        dt_interpolation['wavelength'] = list(range(380,781))
        dt_interpolation['cas'] = list(lagrange_data['cas'].values())
        dt_interpolation['hamamtus_x'] = list(lagrange_data['hamamtus'].values())
        dt_interpolation['hamamtus_y'] = y_interpolation_data

        df_interpolation = pd.DataFrame(dt_interpolation)


        with pd.ExcelWriter(exel_name) as writer:
            df_raw.to_excel(writer, sheet_name='raw')
            df_merge.to_excel(writer, sheet_name='merge')
            df_interpolation.to_excel(writer, sheet_name='interpolation',index=False)

        self.final_data ={
            'cas': dt_interpolation['cas'],
            'hamamtus': dt_interpolation['hamamtus_y']
        }