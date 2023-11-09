import CreateBlankDic

class RemoveDarkCurrent:

    def __init__(self, lagrange_data, intgtime):
        element_dark_current = [0.0000000000000001, -0.00000000003, 0.00003, 116.25]

        self.dark_current_removed_data = {}

        Intg = intgtime
        PIXEL = lagrange_data

        for pixel in PIXEL.keys():
            remove_dark_current = PIXEL[pixel] - (Intg**3 * element_dark_current[0] + Intg**2 * element_dark_current[1] + Intg * element_dark_current[2] + element_dark_current[3])
            self.dark_current_removed_data[int(pixel)] = remove_dark_current
