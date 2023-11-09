import CreateBlankDic

class GetMergedSPD:


    def __init__(self, data):
        PixelNum = 288
        Optimal_signal_level = 500
        intg_key = 'Intg.'

        self.merged_data = CreateBlankDic.createBlankDic(range(0,288))

        for pixel in range(0, PixelNum):
            pixel_data = []
            for index in range(len(data[pixel])):
                if data[pixel][index] >= Optimal_signal_level:
                    # pixel_data['intensity'] = data[pixel][index]
                    # pixel_data['Intg'] = data[intg_key][index]
                    pixel_data = [data[pixel][index], int(data[intg_key][index])]
                    break

            if len(pixel_data ) == 0:
                # pixel_data['Intg'] = data[intg_key][len(pixel_data) - 1]
                # pixel_data['intensity'] = data[pixel][len(pixel_data) - 1]
                pixel_data = [data[pixel][len(pixel_data) - 1], int(data[intg_key][len(pixel_data) - 1])]

            self.merged_data[pixel]  = pixel_data


