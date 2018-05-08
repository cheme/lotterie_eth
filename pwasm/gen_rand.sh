rand=""
#sep='","'
sep=','
for word in $(od -A n -t u1 -N 32 /dev/random)
do
        rand=$rand$sep$word
done
echo $rand
