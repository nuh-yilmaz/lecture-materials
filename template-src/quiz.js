/* ---------------- TEST ----------------
   EXAMPLE QUESTIONS: replace them (format: see TEST at the top). Default test: 6 automatic items, 84 points:
     mcq 4 · tf 10 (5 statements, 2 each) · order 16 (5 steps) · match 15 (5 rows, 3 each) · fill 15 (5 blanks, 3 each)
     · order 24 (mechanism chain, 7 steps; on another module than the 16-point order item).
   Every order item: 4 points per consecutive pair (16 = 5 steps, 24 = 7 steps).
   Total = items (84) + confidence points (−24 to +12) + 4-point gift = 100 at most; never below 0.
   The open type stays for special cases (scored by the lecturer); the default test has no open item. */
const QUIZ=[
  {type:"mcq",pts:4,mod:"ornek1",
   q:{tr:"Negatif geri bildirimle düzenlenen bir değişken ayar noktasının üstüne çıkıyor. Etkileyici ne yapar?",en:"A variable regulated by negative feedback rises above its set point. What does the effector do?"},
   o:{tr:["Değişkeni daha da yükseltir","Değişkeni ayar noktasına doğru geri çeker","Algılayıcının çalışmasını durdurur","Ayar noktasını kalıcı olarak yükseltir","Hiçbir yanıt vermez"],
      en:["It raises the variable even further","It pulls the variable back toward the set point","It stops the sensor from working","It raises the set point permanently","It gives no response"]},a:1,
   why:{tr:"Negatif geri bildirimde etkileyici, sapmanın tersi yönde çalışır ve değişkeni ayar noktasına doğru geri çeker.",en:"In negative feedback the effector works against the deviation and pulls the variable back toward the set point."}},
  {type:"tf",pts:10,mod:"ornek1",mods:["ornek2","ornek1","ornek2","ornek1","ornek1"],
   q:{tr:"Her ifade için Doğru ya da Yanlış seçin.",en:"Mark each statement true or false."},
   o:{tr:["Damar yarıçapı yarıya inerse direnç yaklaşık 16 katına çıkar.","Negatif geri bildirim, değişkendeki değişikliği büyütür.","Basınç farkı sıfır olursa akım da sıfır olur.","Negatif geri bildirim, bozucu etkinin yarattığı sapmayı her zaman tamamen sıfırlar.","Pozitif geri bildirim, başlangıçtaki değişikliği daha da büyütür."],
      en:["If the vessel radius is halved, resistance rises about 16-fold.","Negative feedback makes the change in the variable larger.","If the pressure difference is zero, flow is also zero.","Negative feedback always removes the whole deviation caused by a disturbance.","Positive feedback makes the initial change even larger."]},a:[true,false,true,false,true],
   fix:{tr:["Doğru: direnç 1/r⁴ ile değişir; 2⁴ = 16.","Yanlış: değişikliği küçültür; büyüten pozitif geri bildirimdir.","Doğru: akım = basınç farkı / direnç.","Yanlış: sapma küçülür ama çoğu zaman bir miktar kalır (kazanç sonsuz değildir).","Doğru: pozitif geri bildirim değişikliği büyütür; negatif geri bildirim küçültür."],
        en:["True: resistance changes with 1/r⁴; 2⁴ = 16.","False: it makes the change smaller; positive feedback makes it larger.","True: flow = pressure difference / resistance.","False: the deviation becomes smaller but usually some remains (the gain is not infinite).","True: positive feedback makes the change larger; negative feedback makes it smaller."]},
   why:{tr:"Her ifade eşit puan alır.",en:"Each statement earns equal points."}},
  {type:"order",pts:16,mod:"ornek2",
   q:{tr:"Damar 1 daralınca olanları doğru sıraya koyun.",en:"Put the events that follow the narrowing of vessel 1 in the correct order."},
   o:{tr:["Damar 1'in direnci artar","Basınç farkı sabitken akım azalır","Damar 1'in duvarındaki düz kas kasılır","Seri bağlı iki damarın toplam direnci artar","Damar 1'in yarıçapı azalır"],
      en:["The resistance of vessel 1 rises","At a constant pressure difference, flow falls","The smooth muscle in the wall of vessel 1 contracts","The total resistance of the two vessels in series rises","The radius of vessel 1 falls"]},a:[2,4,0,3,1],
   why:{tr:"Düz kas kasılır → yarıçap azalır → damar 1'in direnci artar (direnç 1/r⁴ ile değişir) → seri dirençler toplandığı için toplam direnç artar → akım = basınç farkı / direnç olduğundan akım azalır.",en:"Smooth muscle contracts → the radius falls → the resistance of vessel 1 rises (resistance changes with 1/r⁴) → series resistances add, so the total resistance rises → flow = pressure difference / resistance, so flow falls."}},
  {type:"match",pts:15,mod:"ornek1",
   q:{tr:"Her terimi tanımıyla eşleştirin. Bir seçenek açıkta kalacak.",en:"Match each term with its definition. One option will be left over."},
   left:{tr:["Algılayıcı","Kontrol merkezi","Etkileyici","Ayar noktası","Pozitif geri bildirim"],en:["Sensor","Control center","Effector","Set point","Positive feedback"]},
   o:{tr:["Düzeltici yanıtı oluşturur","Değişkenin korunmaya çalışılan hedef değeri","Değişikliği ölçer","Değişikliği daha da büyütür","Gelen bilgiyi ayar noktasıyla karşılaştırır","Değişikliği yalnızca kaydeder, yanıt vermez"],
      en:["Produces the corrective response","The target value of the regulated variable","Measures the change","Makes the change even larger","Compares the incoming information with the set point","Only records the change and gives no response"]},a:[2,4,0,1,3],
   why:{tr:"Açıkta kalan f seçeneği geri bildirim döngüsünün bir parçası değildir.",en:"The leftover option f is not part of a feedback loop."}},
  {type:"fill",pts:15,mod:"ornek2",mods:["ornek2","ornek2","ornek2","ornek2","ornek1"],
   q:{tr:"Boşlukları listeden seçerek doldurun.",en:"Fill in the blanks by choosing from the lists."},
   segs:{tr:["Akım, "," ile doğru orantılıdır. Akım, "," ile ters orantılıdır. Damar yarıçapı yarıya inerse direnç yaklaşık "," katına çıkar. Seri bağlı iki damarın toplam direnci, dirençlerin "," eşittir. Negatif geri bildirimde etkileyici, sapmayı "," yönde çalışır."],
         en:["Flow is directly proportional to "," Flow is inversely proportional to "," If the vessel radius is halved, resistance rises about "," times. The total resistance of two vessels in series equals the "," of their resistances. In negative feedback the effector works in the direction that "," the deviation."]},
   blanks:[{o:{tr:["basınç farkı","direnç","damar uzunluğu"],en:["the pressure difference.","resistance.","vessel length."]},a:0},
           {o:{tr:["basınç farkı","direnç","yarıçap"],en:["the pressure difference.","resistance.","the radius."]},a:1},
           {o:{tr:["2","4","16"],en:["2","4","16"]},a:2},
           {o:{tr:["toplamına","farkına","çarpımına"],en:["sum","difference","product"]},a:0},
           {o:{tr:["küçültecek","büyütecek","değiştirmeyecek"],en:["reduces","enlarges","does not change"]},a:0}],
   why:{tr:"Akım = basınç farkı / direnç; direnç 1/r⁴ ile değişir; seri dirençler toplanır; negatif geri bildirim sapmayı küçültür.",en:"Flow = pressure difference / resistance; resistance changes with 1/r⁴; series resistances add; negative feedback reduces the deviation."}},
  {type:"order",pts:24,mod:"ornek1",
   q:{tr:"Bir negatif geri bildirim döngüsünün basamaklarını doğru sıraya koyun.",en:"Put the steps of a negative feedback loop in the correct order."},
   o:{tr:["Kontrol merkezi ölçülen değeri ayar noktasıyla karşılaştırır","Bir bozucu etki değişkeni ayar noktasından uzaklaştırır","Değişken ayar noktasına yaklaşır","Algılayıcı kontrol merkezine sinyal gönderir (afferent yol)","Algılayıcı değişikliği ölçer","Etkileyici düzeltici yanıt verir","Kontrol merkezi etkileyiciye sinyal gönderir (efferent yol)"],
      en:["The control center compares the measured value with the set point","A disturbance moves the variable away from its set point","The variable moves back toward the set point","The sensor sends a signal to the control center (afferent pathway)","The sensor measures the change","The effector gives a corrective response","The control center sends a signal to the effector (efferent pathway)"]},a:[1,4,3,0,6,5,2],
   why:{tr:"Bozucu etki → algılayıcı ölçer → afferent yol → kontrol merkezi karşılaştırır → efferent yol → etkileyici yanıt verir → değişken ayar noktasına döner.",en:"Disturbance → the sensor measures → afferent pathway → the control center compares → efferent pathway → the effector responds → the variable returns toward the set point."}}
];
/* OPEN ITEM (special cases only; scored by the lecturer in the Sheet). Example format:
  {type:"open",pts:26,mod:"ornek1",
   q:{tr:"…",en:"…"}, ph:{tr:"Örneğin: …",en:"For example: …"},
   rubric:{tr:["step 1","step 2","step 3","step 4"],en:[…]},
   why:{tr:"Cevabınızı ölçütle karşılaştırın. Bu soruyu eğitimci, her basamak için tam / kısmen / yok olarak puanlar.",en:"Compare your answer with the guide. The lecturer scores this question as full / partial / none for each step."}}
  With an open item the points rule still holds: all item points + 2 per automatic item + 4 = 100. */
/* M6 MINI-QUIZ (Kahoot style; used when TESTS.mid is true). 4–5 quick items, one try, timed on the phone.
   Types: mcq · tf (1 statement) · match (2 pairs, 1 option left over) · fill (1 blank).
   Time: tf 10 s · mcq 20 s · fill 20 s · match 30 s (sec:* to change).
   Points (calculated on the board #board, from the round's own answers; Q84-A):
     P = share who answered right (time-out = wrong), S = 1 − time/limit
     right: 500 + 500 × (2 − P) × S   (easy for the group: up to 1000; hard: up to 1500)   wrong: 0 */
const QUIZ_MID=[
  {type:"tf",mod:"ornek1",
   q:{tr:"Doğru mu, yanlış mı?",en:"True or false?"},
   o:{tr:["Algılayıcı düzeltici yanıtı oluşturur."],en:["The sensor produces the corrective response."]},a:[false],
   why:{tr:"Yanlış: düzeltici yanıtı etkileyici oluşturur; algılayıcı değişikliği ölçer.",en:"False: the effector produces the corrective response; the sensor measures the change."}},
  {type:"mcq",mod:"ornek2",
   q:{tr:"Basınç farkı sabitken damar yarıçapı azalırsa akıma ne olur?",en:"If the pressure difference stays the same and the vessel radius falls, what happens to flow?"},
   o:{tr:["Artar","Azalır","Değişmez","Önce artar sonra azalır"],en:["It rises","It falls","It does not change","It first rises, then falls"]},a:1,
   why:{tr:"Yarıçap azalınca direnç artar; akım = basınç farkı / direnç olduğundan akım azalır.",en:"A smaller radius raises resistance; since flow = pressure difference / resistance, flow falls."}},
  {type:"fill",mod:"ornek2",
   q:{tr:"Boşluğu doldurun.",en:"Fill in the blank."},
   segs:{tr:["Damar yarıçapı yarıya inerse direnç yaklaşık "," katına çıkar."],en:["If the vessel radius is halved, resistance rises about "," times."]},
   blanks:[{o:{tr:["2","4","16"],en:["2","4","16"]},a:2}],
   why:{tr:"Direnç 1/r⁴ ile değişir: 2⁴ = 16.",en:"Resistance changes with 1/r⁴: 2⁴ = 16."}},
  {type:"match",mod:"ornek1",
   q:{tr:"Eşleştirin. Bir seçenek açıkta kalacak.",en:"Match. One option will be left over."},
   left:{tr:["Algılayıcı","Etkileyici"],en:["Sensor","Effector"]},
   o:{tr:["Değişikliği ölçer","Düzeltici yanıtı oluşturur","Değişikliği daha da büyütür"],en:["Measures the change","Produces the corrective response","Makes the change even larger"]},a:[0,1],
   why:{tr:"Değişikliği büyütmek pozitif geri bildirimin özelliğidir.",en:"Making the change larger is a feature of positive feedback."}}
];
