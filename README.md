# Triplog [![Build Status](https://travis-ci.org/nioe/triplog.svg?branch=master)](https://travis-ci.org/nioe/triplog) [![codecov.io](https://codecov.io/github/nioe/triplog/coverage.svg?branch=master)](https://codecov.io/github/nioe/triplog?branch=master) #

You took beautiful photos on your last trip, have a great story to tell about what you've seen but no place where to publish it?
Then you are at the right place here! __Triplog__ is a Client-Server-Application which is used to manage trips with several steps.
Each step can have a description, photos and and GPS points to show the distance you covered.

## Technology Stack ##

### Server ###
* Java SE 8, EE 7
* Wildfly
* MongoDB
* JAX-RS

### Client ###
* AngularJS

## Contribute ##
I appreciate every feedback or pull request!

### Maven build ###
To build and test the project simply run Maven in the root directory. It will install all needed backend & frontend dependencies automatically.
```shell
mvn clean package
```
### Frontend ###
If you are working on the frontend only it might be useful to have live reload in place. Do do so simply run
```shell
grunt live
```
in the subfolder ``/triplog-client``.This will start a small web server which automatically updates changed sources. In order to refresh your browser you'll need a LiveReload plugin.
Here for example the [Chrome Plugin](https://chrome.google.com/webstore/detail/livereload/jnihajbhpnppcggbcgedagnkighmdlei).


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
|triplog.media.path|Path on server where pictures are stored|-|
|triplog.mongodb.dbname|The database name where TripLog stores its data|triplog|
|triplog.mongodb.host|The MongoDB server hostname|localhost|
|triplog.mongodb.password|The MongoDB password|-|
|triplog.mongodb.port|The MongoDB server port|27017|
|triplog.mongodb.user|The MongoDB user|-|
|triplog.session.timeout|Session timeout in minutes|60|
