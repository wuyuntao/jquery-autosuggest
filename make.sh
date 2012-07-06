#!/bin/sh

COFFEE=`which coffee`
ACTION="$1"
if [ "$ACTION" != "compile" ]; then
	ACTION="watch"
fi

if [ $? != "0" ]; then
	echo "No CoffeeScript found."
	exit 1
fi

if [ "$ACTION" = "compile" ]; then
	$COFFEE -c src/
	exit $?
fi

if [ "$ACTION" = "watch" ]; then
	$COFFEE -wc src/
	exit $?
fi

echo "Unknown action."
exit 1