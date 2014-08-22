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
|triplog.admin.password|-|password|
|triplog.admin.user|-|admin|
|triplog.mongodb.dbname|-|triplog|
|triplog.mongodb.host|-|localhost|
|triplog.mongodb.port|-|27017|
|triplog.server.host|-|localhost|
|triplog.server.port|-|8080|
|triplog.server.protocol|-|http|
|triplog.session.timeout|Session timeout in minutes|60|
