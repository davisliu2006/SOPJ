#!/bin/sh
# set resource limits
ulimit -t 1          # time limit (1s)
ulimit -m 262144     # memory limit (256 MB)
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
        javac Main.java
        ;;
    *)
        echo "Unsupported language"
        exit 1
        ;;
esac