#!/usr/bin/env bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
for file in $DIR/tasks/*
do
  execfile=$(dirname $(dirname $file))/$(basename $file).exec
  mv $file $execfile
  $execfile
  rm $execfile
done
