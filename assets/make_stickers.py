import numpy as np, os, json, sys, shutil
from PIL import Image, ImageFilter, ImageDraw
from scipy import ndimage as ndi
D=os.path.expanduser('~/Downloads')
OUT='/Users/manishabarol/squarezix code file/assets/stickers'
W=(255,255,255)
SHEETS={
 9: dict(cat='notes',  tol=5, merge=3),
 10:dict(cat='notes',  merge=8),
 12:dict(cat='notes',  bg=[W,(229,229,229)], merge=0, regions=[((0,20,736,968),{}),((0,992,736,1308),{})]),
 14:dict(cat='notes',  merge=6, regions=[((0,0,345,312),{}),((352,0,675,328),{}),((318,318,675,632),{}),
        ((15,312,318,620),dict(cat='papers',rect=1)),((15,625,325,935),dict(cat='papers',rect=1)),((345,635,635,925),dict(cat='papers',rect=1)),((15,938,660,1200),dict(cat='papers',rect=1))]),
 2: dict(cat='pins',   holes=40, merge=1, cuts=[(104,295,130,314)]),
 3: dict(cat='clips',  holes=40, merge=1, cuts=[(228,1213,300,1213)]),
 4: dict(cat='buttons',merge=1),
 13:dict(cat='seals',  bg=['auto'], tol=9, erode=1, merge=1),
 5: dict(cat='devices',holes=1500, merge=3),
 8: dict(cat='devices',holes=1500, merge=2, skip=[5]),
 6: dict(cat='stationery', merge=1),
 11:dict(cat='collage',merge=1, min=250),
 7: dict(cat='alphabet', merge=1, tol=6, limit=26),
}
S=2; R=7
def smooth(m, lo=90, hi=165):
    return m.point(lambda v: 0 if v<lo else 255 if v>hi else int((v-lo)*255/(hi-lo)))
def segment(im,cfg):
    a=np.asarray(im).astype(int); H,Wd=a.shape[:2]
    bgs=[]
    for b in cfg.get('bg',[W]):
        if b=='auto': b=tuple(np.median(np.concatenate([a[2,:],a[-3,:],a[:,2],a[:,-3]]),0).astype(int))
        bgs.append(b)
    cand=np.zeros((H,Wd),bool)
    for b in bgs: cand|=np.abs(a-np.array(b)).max(2)<=cfg.get('tol',10)
    lab,_=ndi.label(cand)
    border=np.unique(np.concatenate([lab[0],lab[-1],lab[:,0],lab[:,-1]])); border=border[border>0]
    bg=np.isin(lab,border); fg=~bg
    if cfg.get('holes'):
        hl,nh=ndi.label(cand&~bg); sz=ndi.sum(np.ones_like(hl),hl,range(1,nh+1))
        fg&=~np.isin(hl,[i+1 for i,s in enumerate(sz) if s>=cfg['holes']])
    if cfg.get('cuts'):
        ci=Image.new('L',(Wd,H),0); d=ImageDraw.Draw(ci)
        for c in cfg['cuts']: d.line(c,fill=255,width=4)
        fg&=np.asarray(ci)==0
    if cfg.get('erode'): fg=ndi.binary_erosion(fg,iterations=cfg['erode'])
    if cfg.get('rect'):
        ys,xs=np.where(ndi.binary_opening(fg,iterations=3)); m=np.zeros_like(fg); m[ys.min():ys.max()+1,xs.min():xs.max()+1]=True
        return [((slice(ys.min(),ys.max()+1),slice(xs.min(),xs.max()+1)),m[ys.min():ys.max()+1,xs.min():xs.max()+1])]
    mg=cfg.get('merge',4); grp,ng=ndi.label(ndi.binary_dilation(fg,iterations=mg) if mg else fg,structure=np.ones((3,3)))
    grp=grp*fg
    if cfg.get('split'):   # separate objects that only just touch
        seeds,ns=ndi.label(ndi.binary_erosion(fg,iterations=cfg['split']))
        sz=ndi.sum(np.ones_like(seeds),seeds,range(1,ns+1)); seeds[np.isin(seeds,[i+1 for i,s in enumerate(sz) if s<150])]=0
        idx=ndi.distance_transform_edt(seeds==0,return_distances=False,return_indices=True)
        near=seeds[idx[0],idx[1]]
        for g in range(1,ng+1):
            ids=np.unique(seeds[(grp==g)&(seeds>0)])
            if len(ids)>1:
                for k,s in enumerate(ids[1:]): ng+=1; grp[(grp==g)&(near==s)]=ng
    items=[]
    for i,sl in enumerate(ndi.find_objects(grp)):
        if sl is None: continue
        m=grp[sl]==i+1
        if m.sum()<cfg.get('min',500) or min(m.shape)<14 or m.sum()<.05*m.size: continue
        items.append((sl,m))
    items.sort(key=lambda t:(t[0][0].start+t[0][0].stop)/2)
    rows=[]
    for it in items:
        cy=(it[0][0].start+it[0][0].stop)/2; hh=it[0][0].stop-it[0][0].start
        if rows and abs(cy-rows[-1][0])<max(30,hh*.45): rows[-1][1].append(it)
        else: rows.append([cy,[it]])
    return [it for r in rows for it in sorted(r[1],key=lambda t:t[0][1].start)]
def emit(im,sl,m,cat,manifest,dbg):
    y0,y1,x0,x1=sl[0].start,sl[0].stop,sl[1].start,sl[1].stop
    rgb=im.crop((x0,y0,x1,y1)); pp=(R+4)//S+2
    m2=np.pad(m,pp); filled=ndi.binary_fill_holes(m2)
    big=((x1-x0+2*pp)*S,(y1-y0+2*pp)*S)
    up=lambda arr:Image.fromarray((arr*255).astype('uint8')).resize(big,Image.BICUBIC)
    oa=smooth(up(m2).filter(ImageFilter.GaussianBlur(1.3)))
    fa=up(filled)
    outer=smooth(fa.filter(ImageFilter.GaussianBlur(R*.75)),18,40).filter(ImageFilter.GaussianBlur(.8))
    fa_s=smooth(fa.filter(ImageFilter.GaussianBlur(1.3)))
    ring=Image.fromarray((np.asarray(outer).astype(float)*(255-np.asarray(fa_s))/255).astype('uint8'))
    alpha=Image.fromarray(np.maximum(np.asarray(oa),np.asarray(ring)))
    canvas=Image.new('RGB',big,'white')
    canvas.paste(rgb.resize(((x1-x0)*S,(y1-y0)*S),Image.LANCZOS),(pp*S,pp*S))
    out=Image.composite(canvas,Image.new('RGB',big,'white'),oa); out.putalpha(alpha)
    lst=manifest.setdefault(cat,[])
    os.makedirs(f'{OUT}/{cat}',exist_ok=True)
    fn=f'{cat}/{len(lst)+1:02d}.webp'; out.save(f'{OUT}/{fn}',quality=90,method=4)
    lst.append(dict(src=fn,w=int(big[0]),h=int(big[1]))); dbg.setdefault(cat,[]).append(out)
def process(n,cfg,manifest,dbg):
    full=Image.open(f'{D}/_ ({n}).jpeg').convert('RGB'); k=0
    for box,ov in cfg.get('regions',[((0,0)+full.size,{})]):
        c={**cfg,**ov}; im=full.crop(box); its=segment(im,c)
        its=[it for i,it in enumerate(its) if i+1 not in c.get('skip',[])][:c.get('limit',999)]
        for sl,m in its: emit(im,sl,m,c['cat'],manifest,dbg); k+=1
    print(n,cfg['cat'],k)
if __name__=='__main__':
    if os.path.isdir(OUT): shutil.rmtree(OUT)
    manifest={}; dbg={}
    for n in SHEETS: process(n,SHEETS[n],manifest,dbg)
    cols=10; cell=140; y=0; ims=[]
    for cat,l in dbg.items():
        rowsn=(len(l)+cols-1)//cols
        sheet=Image.new('RGB',(cols*cell,rowsn*cell),'#e85d9a')
        for i,o in enumerate(l):
            t=o.copy(); t.thumbnail((cell-10,cell-10)); sheet.paste(t,((i%cols)*cell+5,(i//cols)*cell+5),t)
        ims.append(sheet)
    out=Image.new('RGB',(cols*cell,sum(i.height+6 for i in ims)),'black')
    for i in ims: out.paste(i,(0,y)); y+=i.height+6
    half=out.height//2
    out.crop((0,0,out.width,half)).save('view_1.png'); out.crop((0,half,out.width,out.height)).save('view_2.png')
    json.dump(manifest,open('manifest.json','w'))
    print({k:len(v) for k,v in manifest.items()})
