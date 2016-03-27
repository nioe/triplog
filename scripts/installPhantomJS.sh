#!/bin/bash

echo Current PhantomJS version is `phantomjs --version`

if [ -f travis-phantomjs/phantomjs-2.1.1-linux-x86_64/bin/phantomjs ]; then
    echo PhantomJS 2.1.1 already downloaded.
else
    rm -rf travis-phantomjs
    mkdir travis-phantomjs
    wget https://assets.membergetmember.co/software/phantomjs-2.1.1-linux-x86_64.tar.bz2 -O $PWD/travis-phantomjs/phantomjs-2.1.1-linux-x86_64.tar.bz2
    tar -xvf $PWD/travis-phantomjs/phantomjs-2.1.1-linux-x86_64.tar.bz2 -C $PWD/travis-phantomjs
fi

export PATH=$PWD/travis-phantomjs/phantomjs-2.1.1-linux-x86_64/bin:$PATH

echo New PhantomJS version is `phantomjs --version`