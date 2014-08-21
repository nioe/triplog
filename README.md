# TripLog #

TripLog is a Client-Server-Application which is used to manage trips with serveral steps. Each step can have a description, several photos and a link to a google map to show the distance you covered.

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
```
#!xml

<system-properties>  
    <property name="key" value="value"/>  
</system-properties>  
```

### Possible Properties ###
|Key|Description|Default Value|
|---|---|---|
|triplog.mongodb.port|-|27017|
|triplog.admin.password|-|password|
|triplog.server.port|-|8080|
|triplog.mongodb.dbname|-|triplog|
|triplog.session.timeout|-|3600000|
|triplog.server.protocol|-|http|
|triplog.admin.user|-|admin|
|triplog.server.host|-|localhost|
|triplog.mongodb.host|-|localhost|