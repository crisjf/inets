# iNets

Web app to visualize diffusion in a static network

## Data strucutre:

links.js
```
Links between industries. It includes the weight. This file is necessary for the viz.

Ex:
{"parentId":605,"childId":404,"weight":3.2917454502}

parentId : Id of the source node
childId  : Id of the target node
weight   : Weight of the link
```

nodesPositions.js
```
Properties of the nodes in the network, including position, name and community they belong to. This file is necessary for the viz.

Ex:
{"id":512,"name":"Dairies","community_id":5,"x":0.9006757328,"y":0.6182793224}

id           : Id of the node, used as key
name         : Name of the node
community_id : Id of the community, used for coloring
x            : x-coordinate (normalized between 0,1)
y            : y-coordinate (normalized between 0,1)
```

nodesChanges.js
```
Time evolution of the cities in the network. This file is necessary for the viz.

Ex:
{"year":1920,"city":"Sweden","id":512,"activated":1,"size":0.8801511249,"export":268975.8253967639,"share":0.0217021251}

year      : Observation year, used as key
city      : Name of city, used as key
id        : Node id, used as key
activated : Boolean indicating whether the node is activated that year or not
size      : Size of the node
export    : Total export to be displayed at the top (this field is not necessary)
share     : Total share to be displayed at the top (this field is not necessary)
```

communityName.js
```
Name of each community to use for the legend.

Ex:
{"community_id":1,"name":"Metals and machinery"}

community_id : Id of the community
name         : Community name
```
