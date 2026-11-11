"""Make the test copies of the built template. Usage: python3 copies.py "<Simulator Template.html>" <out dir>
plain.html   the template as built (SHEET_URL "")
midon.html   SHEET_URL=https://example.invalid/exec, mini-quiz on (default switches)
midoff.html  as midon, mini-quiz off (TESTS.mid=false)
open.html    as midoff, item 6 replaced by an open item (26 points, scored by the lecturer)
confoff.html as midoff, CONFIDENCE=false
nopredict.html as midoff, PREDICT=false
edit.html    as midoff, typo fix in item 2 (item code test)
whyedit.html as midoff, item 1 explanation changed (item code test)
"""
import os, sys
src, out = sys.argv[1], sys.argv[2]
os.makedirs(out, exist_ok=True)
s = open(src, encoding="utf8").read()

def sub(t, a, b):
    assert t.count(a) == 1, "not found once: " + a
    return t.replace(a, b)

def save(name, t):
    open(os.path.join(out, name), "w", encoding="utf8").write(t)

save("plain.html", s)
on = sub(s, 'const SHEET_URL="";', 'const SHEET_URL="https://example.invalid/exec";')
save("midon.html", on)
off = sub(on, "mid:true", "mid:false")
save("midoff.html", off)
# open item: replaces the 24-point order item (4+10+16+15+15+26 = 86; + 2 x 5 automatic items + 4 = 100)
i = off.index('  {type:"order",pts:24,')
j = off.index("\n];", i)
OPEN = ('  {type:"open",pts:26,mod:"ornek1",\n'
        '   q:{tr:"Bir negatif geri bildirim döngüsünü bir örnekle adım adım açıklayın.",en:"Explain a negative feedback loop step by step, using an example."},\n'
        '   ph:{tr:"Örneğin: Bozucu etki → … → …",en:"For example: disturbance → … → …"},\n'
        '   rubric:{tr:["Bir bozucu etki değişkeni ayar noktasından uzaklaştırır","Algılayıcı değişikliği ölçer","Kontrol merkezi değeri ayar noktasıyla karşılaştırır ve etkileyiciyi yönetir","Etkileyicinin yanıtı değişkeni ayar noktasına geri getirir"],\n'
        '           en:["A disturbance moves the variable away from its set point","The sensor measures the change","The control center compares the value with the set point and directs the effector","The effector\'s response brings the variable back toward the set point"]},\n'
        '   why:{tr:"Cevabınızı ölçütle karşılaştırın. Bu soruyu eğitimci, her basamak için tam / kısmen / yok olarak puanlar.",en:"Compare your answer with the guide. The lecturer scores this question as full / partial / none for each step."}}')
save("open.html", off[:i] + OPEN + off[j:])
save("confoff.html", sub(off, "const CONFIDENCE=true;", "const CONFIDENCE=false;"))
save("nopredict.html", sub(off, "const PREDICT=true;", "const PREDICT=false;"))
# item codes: a typo fix in item 2 (comma removed) must change only that code; an explanation edit in item 1 must change none
save("edit.html", sub(off, "Negatif geri bildirim, değişkendeki değişikliği büyütür.", "Negatif geri bildirim değişkendeki değişikliği büyütür."))
save("whyedit.html", sub(off, "Negatif geri bildirimde etkileyici, sapmanın tersi yönde çalışır ve değişkeni ayar noktasına doğru geri çeker.", "Negatif geri bildirimde etkileyici sapmanın tersi yönde çalışır; değişkeni ayar noktasına doğru geri çeker."))
print("copies in", out)
