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
| Key                    | Description       | Default Value  |
| ---------------------- |-------------------| ---------------|
| triplog.admin.user     | The username of the superuser which is able to add, update or delete trips and their content | - |
| triplog.admin.password | The password for the superuser |  - |