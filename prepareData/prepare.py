import json,pandas as pd
def exportJS(varname,data,commit):
    if commit:
        fname = '../data/'+varname+'.js'
    else:
        fname = 'testData/'+varname+'.js'
    f = open(fname,mode='w')
    f.write(('const '+varname+' = '+data.to_json(orient='records')+' \nexport default '+varname).encode('utf-8'))
    f.close()

with open('config.json') as configFile:
    config = json.loads(configFile.read())
commit = config['commit']

nodes = pd.read_csv(config['nodes']['path'])
defaultOrder = config['nodes']['defaultOrder']
outColumns   = config['nodes']['outColumns']
if (config['nodes']['colNames']['nameCol'] is None):
    nodes['name'] = nodes['']
    defaultOrder = defaultOrder[:3]+defaultOrder[4:]
    outColumns   = outColumns[:3]+outColumns[4:]
if (config['nodes']['colNames']['communityCol'] is None):
    defaultOrder = defaultOrder[:-1]
    outColumns   = outColumns[:-1]
if len(nodes.columns)<3:
    raise NameError('Positions should be provided for each node in '+config['nodes']['path'])
elif (len(nodes.columns)==4)&(len(defaultOrder)>4):
    print nodes.dtypes[nodes.columns[-1]]



# for i,col in enumerate(defaultOrder):
    # config['nodes'][col] = (nodes.columns.values[i] if config['nodes'][col] is None else config['nodes'][col])
# columns = [config['nodes'][col] for col in defaultOrder]
# nodes = nodes[columns].rename(columns=dict(zip(columns,outColumns)))
# nodesSet = set(nodes['id'])
# exportJS('nodes',nodes,commit)

# print nodes

# links = pd.read_csv(config['links']['path'])
# defaultOrder = config['links']['defaultOrder']
# outColumns = config['links']['outColumns']
# if (config['links']['colNames']['weightCol'] is None)|(len(links.columns)<3):
#     defaultOrder = defaultOrder[:-1]
#     outColumns   = outColumns[:-1]
# for i,col in enumerate(defaultOrder):
#     config['links']['colNames'][col] = (links.columns.values[i] if config['links']['colNames'][col] == "default" else config['links']['colNames'][col])
# columns = [config['links']['colNames'][col] for col in defaultOrder]
# links = links[columns].rename(columns=dict(zip(columns,outColumns)))
#
# # linksNodeSet = set(links['parentId'])|set(links['childId'])
# # if len(linksNodeSet.difference(nodesSet)) !=0:
# #     raise NameError(str(len(linksNodeSet.difference(nodesSet)))+' nodes found in '+config['links']['path']+' and missing from '+config['nodes']['path'])
# print links
# exportJS('links',links,commit)
#
# # nodesChanges = pd.read_csv(config['nodesChanges']['path'])
# #
