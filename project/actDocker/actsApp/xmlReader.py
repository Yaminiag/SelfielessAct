from xml.dom import minidom

class reader:
	def __init__(self):
		mydoc = minidom.parse('generic.xml')
		service = mydoc.getElementsByTagNameNS('*','service')[0]
		serv = {}
		serv = self.info(service)
		if(service.getElementsByTagName('count') != None):
			serv['count'] = service.getElementsByTagName('count')[0].firstChild.data
		else:
			serv['count'] = 1

		if(service.getElementsByTagName('health') != None):
			serv['health'] = service.getElementsByTagName('health')[0].firstChild.data
		else:
			serv['health'] = '/'

		alarm = service.getElementsByTagNameNS('*','alarm')[0]

		if(alarm != None):
			serv['alarm'] = True
			serv['threshold'] = alarm.getElementsByTagName('threshold')[0].firstChild.data
			serv['time'] = int(alarm.getElementsByTagName('time')[0].firstChild.data)
		else:
			serv['alarm'] = False

		if(mydoc.getElementsByTagNameNS('*','database')[0] != None):
			serv['database'] = self.info(mydoc.getElementsByTagNameNS('*','database')[0])

		self.serv = serv



	def info(self,service):
		temp = {}

		if(service.getElementsByTagName('image') != None):
			temp['image'] = service.getElementsByTagName('image')[0].firstChild.data
		elif(service.getElementsByTagName('dockerfile') != None):
			print('Use docker file')
		else:
			print('Please provide image name')

		if(service.getElementsByTagName('detach') != None):
			temp['detach'] = service.getElementsByTagName('detach')[0].firstChild.data
		else:
			temp['detach'] = True

		if(service.getElementsByTagName('mapping') != None):
			temp['mapping'] = service.getElementsByTagName('mapping')[0].firstChild.data.split(':')
		else:
			print('Mapping Required')

		if(service.getElementsByTagName('memory_limit') != None):
			temp['memory_limit'] = service.getElementsByTagName('memory_limit')[0].firstChild.data + 'm'
		else:
			temp['memory_limit'] = '512m'
		return temp
