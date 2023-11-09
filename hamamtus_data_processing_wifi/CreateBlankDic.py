class CreateBlankDic:

    def __init__(self):
        createBlankDic()


def createBlankDic(keys):
    data = {}

    for i in keys:
        data[i] = []

    return data