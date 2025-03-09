#!/bin/sh
# set resource limits
ulimit -t 1          # time limit (1s)
ulimit -m 262144     # memory limit (256 MB)
ulimit -f 1024       # file size limit (1 MB)

# execute the user's code
case "$1" in
    c)
        gcc /home/judge/main.c -o /tmp/main && /tmp/main
        ;;
    cpp)
        g++ /home/judge/main.cpp -o /tmp/main && /tmp/main
        ;;
    python)
        python3 /home/judge/main.py
        ;;
    java)
        javac /home/judge/main.java && java -cp /home/judge Main
        ;;
    *)
        echo "Unsupported language"
        exit 1
        ;;
esac