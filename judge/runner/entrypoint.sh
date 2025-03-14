#!/bin/sh
# set resource limits
ulimit -t 1          # time limit (1s)
ulimit -m 262144     # memory limit (256 MB)
ulimit -f 1024       # file size limit (1 MB)

# execute the user's code
cd /home/judge
case "$1" in
    c)
        run/main < run/input.in > run/output.out
        ;;
    c++)
        run/main < run/input.in > run/output.out
        ;;
    python)
        python3 run/main.py < run/input.in > run/output.out
        ;;
    java)
        java -cp Main < run/input.in > run/output.out
        ;;
    *)
        echo "Unsupported language"
        exit 1
        ;;
esac