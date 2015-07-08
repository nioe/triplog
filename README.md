# TripLog #

TripLog is a Client-Server-Application which is used to manage trips with serveral steps.
Each step can have a description, several photos and and GPS points to show the distance you covered.

## Technology Stack ##

### Server ###
* Java SE 8, EE 7
* Wildfly (JBoss 8)
* MongoDB
* JAX-RS

### Client ###
* AngularJS

## JBoss Configuration - System properties ##
The server application is reading the configuration from system properties set in *standalone.xml*.

### Example ###
```xml
<system-properties>  
    <property name="key" value="value"/>  
</system-properties>  
```

### Possible Properties ###
|Key|Description|Default Value|
|---|---|---|
|triplog.admin.password|The admin password which is used to add, delete or update content|password|
|triplog.admin.user|The admin username which is used to add, delete or update content|admin|
|triplog.mongodb.dbname|The database name where TripLog stores its data|triplog|
|triplog.mongodb.host|The MongoDB server hostname|localhost|
|triplog.mongodb.password|The MongoDB password|-|
|triplog.mongodb.port|The MongoDB server port|27017|
|triplog.mongodb.user|The MongoDB user|-|
|triplog.server.host|TripLog server's hostname|localhost|
|triplog.server.port|Server port for TripLog services|8080|
|triplog.server.protocol|The protocol which is used to access the TripLog services|http|
|triplog.session.timeout|Session timeout in minutes|60|
