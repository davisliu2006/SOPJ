#!/bin/sh
ulimit -f 1024       # file size limit (1 MB)

# execute the user's code
cd /home/judge
case "$1" in
    c)
        gcc compile/main.c -o compile/main
        ;;
    c++)
        g++ compile/main.cpp -o compile/main
        ;;
    java)
        javac compile/Main.java -d compile
        ;;
    *)
        echo "Unsupported language"
        exit 1
        ;;
esac