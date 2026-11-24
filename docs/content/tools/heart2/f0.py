import subprocess,numpy as np,sys
def f0(f):
    b=subprocess.run(f"ffmpeg -v error -i {f} -vn -ac 1 -ar 16000 -f s16le -",shell=True,capture_output=True).stdout
    x=np.frombuffer(b,np.int16).astype(float)/32768; out=[]
    for i in range(0,len(x)-1024,320):
        fr=x[i:i+1024]
        if np.sqrt((fr**2).mean())<0.02: continue
        c=np.correlate(fr,fr,'full')[1023:]; lo,hi=16000//500,16000//70; l=lo+np.argmax(c[lo:hi])
        if c[l]>0.4*c[0]: out.append(16000/l)
    return round(np.median(out)) if out else 0
for f in sys.argv[1:]: print(f, f0(f))
