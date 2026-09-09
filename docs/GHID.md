# SOP: ce face experimentul și cum îi verificăm rezultatele

Ghid pentru programatori · 9 septembrie 2026 · Execuție verificată: Node.js 22.16.0, Linux x64

## 1. Ce testăm

Experimentul testează două întrebări: putem executa cunoaștere ca programe SOP și putem construi unele programe SOP reutilizabile din exemple? Răspunsul este pozitiv în cazurile mici și bine definite din pachet. Nu se antrenează un model pe documente și nu se obține un model general de limbaj.

Demonstrația vizibilă începe cu două fapte: Alice este în laborator și cartea este în laborator. Pentru textul `Alice picked up book.`, programul recunoaște evenimentul, verifică dacă preluarea este permisă, adaugă relația de posesie și produce `Alice now holds book.`.

```bash
node demo.mjs
```

Acest exemplu funcționează deoarece tiparul propoziției și regula preluării sunt deja scrise în bibliotecă. Nu dovedește că sistemul a descoperit singur sensul verbului „a lua”.

| Componentă | De unde vine efectiv |
|---|---|
| Reguli de mișcare, preluare, eliberare și transfer | Sunt programe furnizate. Rularea le execută și le verifică; nu le învață. |
| Tipare de propoziții și formulări de răspuns | Sunt programe SOP scrise manual. |
| Continuări de evenimente | Sunt generalizate din demonstrații care sunt deja programe SOP. |
| Funcții numerice mici | Sunt sintetizate prin încercarea unor programe și compararea ieșirilor cu exemplele. |

Rezultatul de învățare cel mai relevant este concret: din demonstrații în care diferă participanții, dar operațiile au aceeași structură, sistemul poate produce un program parametrizat. Același program funcționează apoi pentru nume care nu apar în demonstrații. Separat, căutarea numerică poate descoperi câteva compoziții de adunare și înmulțire fără să primească programul răspuns.

Ținta este extinderea acestui mecanism la operații mai bogate: observații, program candidat, verificare pe cazuri separate, apoi integrare în bibliotecă. Testele actuale nu demonstrează că această extindere va funcționa automat. Ele identifică o bază executabilă și locurile unde mecanismul se oprește.

Pentru o decizie practică: pachetul merită folosit ca laborator de învățare și execuție de programe mici. Nu trebuie folosit ca interpret sigur al textului liber. Ghidul arată atât exemplele reușite, cât și opt limite reproduse în `results/audit.json`.

<!-- page -->

# 2. Ce este un circuit în cod

Un circuit este un fișier SOP executabil. Fiecare declarație produce o valoare. Referințele `$nume` spun ce valori consumă alte declarații. Comanda provine din calea fișierului: `commands/relation/join.mjs` devine `relation.join`. Apelul arată la fel când implementarea este un fișier `.sop`.

Următorul program este `examples/take-readable.sop`. El produce efectul unei preluări permise; aplicarea efectului asupra stării este o operație separată.

```sop
@input input
@event frame.event source $input
@state frame.state source $input
@person logic.variable
@object logic.variable
@place logic.variable
@holder logic.variable
@seed bindings.unit
@q0 relation.join rows $seed facts $event
  name "take" arg0 $person arg1 $object
@q1 relation.join rows $q0 facts $state
  name "at" arg0 $person arg1 $place
@q2 relation.join rows $q1 facts $state
  name "at" arg0 $object arg1 $place
@q3 relation.absent rows $q2 facts $state
  name "holds" arg0 $holder arg1 $object
@output effect.add rows $q3
  name "holds" arg0 $person arg1 $object
```

`q0` identifică persoana și obiectul din eveniment. `q1` găsește locul persoanei. `q2` cere ca obiectul să fie în același loc: reutilizează exact variabila `$place`. `q3` blochează preluarea dacă cineva deține deja obiectul, inclusiv persoana din eveniment. Dacă rămâne un rând de legări valid, ieșirea conține efectul de adăugare a posesiei.

Cu persoana în `lab` și obiectul în `office`, `q2` nu produce niciun rând. Circuitul nu emite efecte. Cu amândoi în `lab`, dar posesia incomplet cunoscută, nu se poate justifica absența unui deținător și execuția poate întoarce `unknown`.

MJS implementează operațiile generice, precum potrivirea tuplurilor. SOP stabilește ce relații se verifică și cum se leagă participanții. Un fapt materializat este o valoare, nu un program. Programul și datele sale nu trebuie confundate.

`@input` și `@output`, argumentele numite, `$` și `~` sunt descrise în `docs/SOP_REFERENCE.md`. Compatibilitatea cu un runtime SOP extern nu este testată aici.

<!-- page -->

# 3. Executarea regulilor furnizate: ce verifică 4.800 și 7.168

**Întrebarea testată:** execută runtime-ul corect programele de tranziție furnizate, inclusiv atunci când condițiile blochează o acțiune?

Datele sunt tupluri precum `["at","Alice","lab"]` și `["holds","Alice","book"]`. Evenimentele suportate sunt `travel`, `take`, `drop` și `give`. De exemplu, dacă Alice deține cartea și se deplasează la birou, locația cărții se schimbă împreună cu locația persoanei. Dacă încearcă să transfere cartea unei persoane aflate în altă locație, posesia nu se schimbă.

Sunt testate cinci seturi furnizate de câte opt programe. Fiecare set primește 960 de observații salvate, în total **4.800/4.800 stări finale corecte**. Corect înseamnă egalitatea întregii mulțimi de fapte rezultate, nu numai prezența unui fapt favorabil. Ordinea faptelor nu contează.

Predicția este comparată cu starea finală din observație și cu un evaluator procedural separat, `experiments/support/oracle.mjs`. Evaluatorul nu execută SOP. Această separare reduce riscul ca aceeași greșeală de interpretare să producă și predicția, și răspunsul de referință; nu elimină posibilitatea unei greșeli comune în descrierea lumii.

Un set este verificat și pe **7.168/7.168 tranziții distincte**. Această lume conține două persoane, trei obiecte și două locuri. Sunt 256 de stări admise și 28 de evenimente per stare. Toate combinațiile respective sunt enumerate. „Exhaustiv” se referă numai la această lume finită și la acel set de programe, nu la orice stare sau orice circuit.

**Ce s-a validat:** comportamentul executabil al acestor programe pe observațiile salvate și pe domeniul finit enumerat. **Ce nu s-a validat:** învățarea regulilor de tranziție în această rulare, generalizarea la alte legi ale lumii sau gestionarea intrărilor arbitrar inconsistente.

O declarație `coverage` spune că lista faptelor pentru anumite relații este completă pentru fotografia furnizată. Runtime-ul verifică potrivirea fotografiei, nu sinceritatea sau completitudinea cunoașterii apelantului. Fără justificarea necesară, lipsa unui fapt nu devine automat falsitate.

**Cum cade afirmația:** un singur dezacord cu evaluatorul în cele 7.168 de cazuri invalidează afirmația „corect pe întreaga lume enumerată”. Acesta este un test de regresie, nu o demonstrație matematică despre toate programele SOP.

Dovezi: `results/transition-records.json`, `results/exhaustive-records.json`, `results/summary.json → transitions`. Programe: `commands/knowledge/transitions/model*/`.

<!-- page -->

# 4. Învățarea prin generalizarea demonstrațiilor SOP

**Ce primește mecanismul:** trei programe SOP cu aceeași structură, dar cu participanți diferiți. Nu primește trei propoziții libere. Pentru prima familie, profesorul furnizează demonstrații echivalente cu:

```text
pickup(Alice, book), inspect(Alice, book) -> store(Alice, book)
pickup(Bob, box),    inspect(Bob, box)    -> store(Bob, box)
pickup(Cora, map),   inspect(Cora, map)   -> store(Cora, map)
```

Aceasta este o notare a datelor, nu un DSL executat. Demonstrațiile executabile sunt produse de `experiments/support/completion.mjs`. `abstractPrograms()` compară structurile lor și înlocuiește coloanele de valori care se schimbă cu variabile logice comune.

Programul rezultat aplicat la `pickup(Ana, manual), inspect(Ana, manual)` produce `store(Ana, manual)`. Acest caz se vede în `node demo.mjs`.

Sunt **patru familii**, fiecare cu trei demonstrații și 250 de teste cu identificatori diferiți: **1.000/1.000 continuări corecte**. Celelalte familii au succesiunile `travel/pickup/drop`, `ask/answer/ack` și `pickup/give/thank`, cu legături explicite între participanți. Sensul acestor succesiuni este furnizat de profesor, nu descoperit din experiență nestructurată.

În **400/400 teste** se modifică un participant din al doilea eveniment astfel încât nu mai respectă legătura învățată. Programul nu mai produce continuarea. Acest rezultat verifică păstrarea legăturilor, nu înțelegerea tuturor rolurilor posibile. Căutarea exactă a episoadelor concrete nu găsește niciunul dintre cele 1.000 de contexte cu nume noi; acesta este un comparator slab, nu un model de limbaj competitiv.

În **50/50 cazuri** destinația cerută de continuare nu este legată de intrare. Rezultatul este `unknown`, nu o destinație inventată. Nu se generează încă valori noi.

**Limită reprodusă:** dacă toate demonstrațiile folosesc aceeași persoană și pentru întrebare, și pentru răspuns, mecanismul unește cele două roluri. Pentru o întrebare Alice–Bob produce o listă goală. Exemplele nu ofereau informația care să distingă rolurile. Sunt necesare demonstrații în care valorile pot varia independent.

**Cum se infirmă transferul testat:** apariția numelor de antrenare în rezultat, pierderea unei egalități necesare sau o continuare greșită pentru identitățile de test. Grafurile cu topologii nealiniate sunt respinse: potrivirea lor generală nu este implementată.

Dovezi: `results/completion-records.json`, `results/wrong-role-records.json`, `results/audit.json`. Cod: `src/learning.mjs → abstractPrograms`.

<!-- page -->

# 5. Sinteza din intrări și ieșiri: ce descoperă efectiv

**Ce primește mecanismul:** exemple numerice și o listă explicită de operatori: adunare, scădere și înmulțire. Nu primește formula răspuns. Caută expresii mici, le emite ca SOP și le execută pentru a compara ieșirile cu exemplele.

Cele trei ținte sunt `2*a+b`, `a*b+a` și `(a+b)*(a+b)`. De exemplu, pentru prima țintă, programul sintetizat calculează `a+b`, apoi adaugă încă o dată `a`. Cu `a=4, b=3`, rezultatul este `11`.

```sop
@input input
@input0 data.get source $input key "a"
@input1 data.get source $input key "b"
@node0 number.add left $input0 right $input1
@node1 number.add left $input0 right $node0
@output data.identity value $node1
```

Pentru fiecare țintă sunt trei împărțiri deterministe ale datelor. O rulare folosește 12 exemple de căutare, 8 exemple de selecție și 200 de teste finale: **1.800/1.800 evaluări finale corecte în nouă rulări**. Seturile sunt disjuncte în interiorul fiecărei rulări. Între rulări pot exista intrări repetate. Valorile provin din dreptunghiul finit `a=-8..8`, `b=-9..9`; nu este un test de extrapolare numerică nelimitată.

Câmpul numit `validation` participă la alegerea programului. Prin urmare, este set de selecție, nu test final independent. Căutarea a evaluat 22, 25 și 458 de candidați, după țintă, în configurațiile testate. Limita de cost numără apariții de operatori în expresia căutată, nu toate declarațiile din sursa SOP finală.

**Limită reprodusă:** cu un singur exemplu de căutare `(0,0)->0` și exemplele de selecție `(2,3)->25`, `(1,4)->25`, mecanismul răspunde `unknown`. Totuși, programul `(a+b)*(a+b)` satisface exemplele și este exprimabil. Cauza: programele intermediare sunt deduplicate doar după ieșirile de antrenare; aici toate produc zero și este eliminat intermediarul necesar.

Această observație invalidează pretenția că „unknown înseamnă că nu există program în profil”. Nu invalidează cele 1.800 de evaluări reușite. Arată că strategia de căutare trebuie reparată înainte de extinderea vocabularului.

Dovezi: `results/numeric-records.json` păstrează inclusiv datele de selecție și sursele generate. Contraexemplu: `results/audit.json → synthesis-pruning-can-miss-a-solution`. Cod: `src/learning.mjs → synthesize`.

<!-- page -->

# 6. Textul de intrare: unde funcționează și unde se rupe

Parserul nu este învățat. Fiecare fișier din `commands/language/grammar/` potrivește o propoziție întreagă la un tipar de tokeni. De exemplu, construcția pentru `$person picked up $object .` produce evenimentul `take(person, object)`.

Testul conține 12 construcții scrise manual și 100 de variații ale numelor pentru fiecare: **1.200/1.200 interpretări corecte**. Este un test al implementării acestor tipare. Nu reprezintă 1.200 de construcții gramaticale și nu măsoară limbajul liber.

Cele **300/300 refuzuri** folosesc șase forme nesuportate, cu 50 de redenumiri: negare, modalitate, întrebare, pasiv, propoziție compusă și verb neînscris. De exemplu, `Alice did not take book.` nu este interpretată greșit drept o preluare afirmativă. Acest set nu e suficient pentru a afirma că toate intrările nesuportate sunt refuzate sigur.

Traseul complet este testat separat: 100 de secvențe a câte trei acțiuni — preluare, deplasare și eliberare. După fiecare propoziție, starea prezisă este folosită la pasul următor. Cele **300/300 stări finale de pas** corespund evaluatorului procedural. Textul generat descrie schimbarea de stare; nu reprezintă o continuare liberă a poveștii.

## Patru limite care pot fi reproduse imediat

`Alice picked up book` fără punct produce `unknown`. Tiparul cere punctul ca token. Nu există normalizare generală a punctuației.

`Alice inspected book.` este parsată drept `inspect(Alice, book)`, dar execuția produce `unknown`: biblioteca selectată nu conține o regulă de tranziție pentru `inspect`. Recunoașterea și execuția sunt capabilități distincte. La fel, recunoașterea lui `store` nu îi conferă o semantică de execuție.

`Alice grabbed book.` funcționează când este apelat direct circuitul `language.grammar.extension`; acest test are 100/100 potriviri. Parserul implicit o respinge, deoarece lista explicită din `commands/language/parse.sop` nu include extensia. Adăugarea fișierului nu modifică automat lista.

`She picked up book.` produce `take(She, book)`. În starea cu Alice și cartea în laborator, răspunsul este `complete`, starea rămâne neschimbată și textul este gol. „She” este tratat ca identificator, nu legat de Alice. Nu există rezolvare de pronume sau context discursiv. Acesta este un eșec semantic, chiar dacă execuția tehnică se încheie fără eroare.

Dovezi: `results/language-records.json`, `results/pipeline-records.json`, `results/audit.json`. Criteriul pentru îmbunătățire trebuie să includă interpretarea exactă și refuzul justificat, nu numai evitarea excepțiilor.

<!-- page -->

# 7. Ieșirea textuală și ambiguitatea

## Verbalizarea schimbării, nu rezumat de document

`tasks.summarize` primește două stări structurate. Calculează faptele adăugate și eliminate, apoi apelează formulări SOP pentru relațiile `at` și `holds`.

```text
Înainte: at(Alice, lab), at(book, lab), holds(Alice, book)
După:    at(Alice, office), at(book, office)
```

În acest exemplu trebuie exprimate cinci schimbări: eliminarea celor două locații inițiale, eliminarea posesiei și adăugarea celor două locații finale. Programul produce propoziții precum `Alice is no longer at lab.` și `Alice no longer holds book.`. Ordinea formulărilor nu schimbă conținutul factual verificat.

Cele **500/500 cazuri** folosesc această structură de schimbare, variind identificatorii. Un decodor de test, separat de formulările SOP, transformă propozițiile înapoi în fapte adăugate și eliminate. Testul cere egalitatea exactă cu diferența calculată din stări. O inversare „now”/„no longer” este detectată.

Ce este util: un program poate produce o explicație scurtă despre ce a schimbat. Ce nu este testat: alegerea ideilor importante, comprimarea unui document, păstrarea cauzalității unei narațiuni sau formularea fluentă generală. Când diferența include o relație fără formulare, de exemplu `likes`, rezultatul este `unknown`, nu un rezumat incomplet declarat reușit.

Dovezi: `results/summary-records.json`; cod: `commands/tasks/summarize.sop`.

## Alegerea între două interpretări furnizate

Pentru `Alice saw Bob with the telescope.`, biblioteca furnizează dinainte două interpretări: instrumentul folosit de Alice și obiectul asociat cu Bob. Programul nu descoperă singur posibilitatea acestor interpretări.

Cu faptul `uses(Alice, telescope)`, politica selectează interpretarea instrumentală. Cu `has(Bob, telescope)`, selectează cealaltă. Fără niciun suport sau cu suport pentru ambele, păstrează două candidate și raportează `ambiguous`.

Sunt patru situații de suport, fiecare cu 100 de redenumiri: **400/400 rezultate conforme politicii**. Acest rezultat verifică o politică deterministă asupra unor interpretări cunoscute, nu dezambiguizarea generală a limbajului.

`Runtime.attempt()` poate raporta `complete`, în timp ce valoarea întoarsă conține `status: "ambiguous"`. Primul statut descrie execuția; al doilea descrie concluzia. Nu trebuie tratat orice `complete` ca răspuns semantic unic.

Dovezi: `results/ambiguity-records.json`; cod: `commands/tasks/ambiguity.sop`.

<!-- page -->

# 8. Compoziția și găsirea circuitelor

## O relație recursivă funcționează; mii de teorii nu sunt testate

Două circuite furnizate spun, în esență, că un părinte este strămoș și că o relație de strămoș se poate prelungi cu o relație de părinte. Comanda generică `state.close` le reaplică până nu mai apar fapte.

```text
parent(p0, p1), parent(p1, p2), ..., parent(p39, p40)
Rezultat urmărit: ancestor(p0, p40)
Rezultat care nu trebuie să apară: ancestor(p40, p0)
```

Au fost verificate **14/14 întrebări**, șapte pozitive și șapte negative, la distanțele 1, 2, 4, 8, 16, 32 și 40. Execuția produce 820 de fapte noi și ajunge la stabilitate după 41 de runde. Numărul 820 este inventarul observat al închiderii; testul raportat de corectitudine are 14 întrebări, nu 820 de demonstrații independente.

Pe un ciclu de două noduri, execuția se oprește și păstrează consecințele reflexive. Dacă bugetul este insuficient, rezultatul este `unknown`. Astfel se verifică și oprirea; nu se demonstrează că orice familie de reguli termină sau că va avea un cost acceptabil.

Ce lipsește: compoziție între multe familii de reguli, căutarea automată a unui plan, efecte temporale și contradicții. Lanțul folosește o singură familie relațională scrisă manual.

Dovezi: `results/summary.json → composition`; cod: `commands/knowledge/ancestor/`, `commands/tasks/ancestors.sop`.

## Indexul actual este mic și exact

`tasks.advance` selectează dintre opt programe folosind identificatorul evenimentului. `SourceIndex` indexează șiruri literale și nume de apeluri din sursele SOP; recuperarea intersectează listele de programe care conțin termenii ceruți.

Nu sunt prezente în traseul executabil HNSW, embeddings sau VSA. Nu este măsurat aici un avantaj de performanță la 100.000 ori un milion de circuite. Mai mult, `program.retrieve` reconstruiește indexul la fiecare apel. Acest lucru este acceptabil pentru demonstrația mică, nu o soluție de catalog persistent la scară mare.

Un index poate propune un circuit care conține un termen fără să fie aplicabil situației. Circuitul verifică ulterior condițiile exacte. A găsi o sursă și a justifica aplicarea ei sunt pași diferiți.

Testul de redenumire a relațiilor și evenimentelor în simboluri opace are **100/100 rezultate corecte**, fără modificarea codului nativ. Arată că acele denumiri nu sunt necesare în kernel. Nu dovedește învățarea unui vocabular nou sau a semnificației lui.

Dovezi: `results/summary.json → frozenKernel`; cod: `src/retrieval.mjs`.

<!-- page -->

# 9. Activarea programelor și limitele de stare

## Activarea este condiționată de teste, nu de adevăr garantat

`src/versions.mjs` stochează surse după hash și actualizează un identificator activ atunci când exemplele furnizate sunt satisfăcute. Experimentul acceptă trei programe simple, `a+1`, `a+2` și `a+3`, sub trei nume diferite. O propunere `a+7` este respinsă pentru numele ale cărui teste cer `a+1`. Reîncărcarea sursei acceptate produce `10` pentru `a=9`.

Aceste verificări validează mecanica locală a activării și respingerii. Nu reprezintă învățare continuă, adaptare automată la schimbarea lumii sau rezolvare de contradicții între surse.

Activarea cere cel puțin un exemplu: un set gol este respins și nu poate înlocui sursa activă. Este o protecție împotriva validării fără dovezi. Un singur exemplu poate totuși fi insuficient, iar un program greșit în alte cazuri poate trece exemple prea sărace.

**Limită reprodusă:** un program apelează un subcircuit care întoarce `1`. După înlocuirea subcircuitului cu unul care întoarce `2`, reîncărcarea aceleiași surse părinte produce `2`, deși hash-ul părintelui este neschimbat. Dependențele tranzitive nu sunt fixate de mecanismul de activare. Reluarea exactă cere un manifest al întregii dependențe, nu numai al fișierului părinte.

Dovezi: `results/summary.json → versions`, `results/audit.json → dependencies-not-pinned`.

## Stările valide sunt o ipoteză a experimentului

În lumea de test, o persoană are o singură locație. Totuși, apelantul poate furniza simultan `at(Alice, lab)` și `at(Alice, office)`. Runtime-ul nu respinge automat contradicția; poate executa o preluare dacă găsește una dintre locațiile necesare. Contraexemplul este salvat în audit.

Acesta este un contract neimpus, nu o demonstrație că logica simbolică nu poate gestiona contradicții. Trebuie adăugat un validator al stării și decis ce se întâmplă când sursele se contrazic. `state.apply` elimină fapte, apoi le adaugă; nu are arbitraj general pentru efecte incompatibile.

Trace-ul identifică producători, hash-uri și dependențe de execuție. Nu păstrează încă pentru orice ieșire o dovadă completă cu pasajele documentelor de origine. Modulele MJS sunt cod de încredere, iar bugetele sunt cooperative, nu un sandbox strict de timp sau memorie.

Testul de rulare cu numai `src/` și `commands/` verifică două cazuri: o propoziție suportată și o negare refuzată. El arată independența acelui traseu de fișierele evaluatorului, nu siguranța universală a aplicației.

<!-- page -->

# 10. Ce este validat, infirmat sau încă nedeterminat

## Validarea are un domeniu, nu un procent universal

Numerele din ghid sunt pentru experimente finite. Cele 1.000 de continuări verifică patru tipare, iar cele 1.200 de propoziții verifică 12 construcții. Redenumirile numeroase sunt utile pentru a detecta memorarea identităților, dar nu adaugă alte tipuri de raționament. Nu calculăm o „acuratețe a sistemului” prin însumarea tuturor cazurilor.

Au fost infirmate pretenții mai largi: parserul nu refuză sigur orice intrare pe care nu o înțelege; căutarea numerică nu găsește toate programele exprimabile în profil; hash-ul sursei părinte nu garantează reluarea rezultatului după schimbarea dependențelor. Fiecare afirmație are un contraexemplu executabil, nu doar o rezervă verbală.

Nu s-a dovedit imposibil un model simbolic de limbaj. Nici `unknown`, nici un scor slab pe un test nu ar demonstra asta. Un caz are însă o limită logică precisă: dacă aceleași observații sunt compatibile atât cu destinația `lab`, cât și cu `office`, ele nu determină o destinație unică. Un generator poate propune variante; nu le poate prezenta ca fapt unic dedus fără informație suplimentară.

## Cum refaci verificarea și cum observi o regresie

```bash
node reproduce.mjs
```

Comanda verifică integritatea, rulează 68 de teste, recalculează experimentele, reproduce auditul, execută verificarea cu biblioteca izolată și confruntă fișierele de rezultate. Orice etapă cu eroare oprește rularea. `node verify.mjs` singur verifică dovezile salvate și fișierele curente; nu substituie recalcularea predicțiilor.

Unele teste au prefixul `LIMIT:` și verifică reproducerea unei deficiențe cunoscute. Faptul că ele trec înseamnă că descrierea deficienței corespunde codului. Nu înseamnă că acea capabilitate a fost rezolvată. Cele opt limite sunt separate de scorurile pozitive în `results/audit.json`.

Trei modificări intenționat greșite sunt detectate: eliminarea condiției „obiectul nu are deținător” produce 13 dezacorduri; eliminarea primei potriviri cu starea produce 38; inversarea polarității unei formulări produce un dezacord textual-factual. **3/3 mutații detectate** arată că testele observă aceste erori, nu că detectează orice eroare posibilă.

Pentru orice rezultat nou trebuie păstrate intrarea, ieșirea așteptată, ieșirea efectivă și sursa verificării. Fișierele `*-records.json` fac acest lucru pentru principalele teste. Manifestul detectează modificarea fișierelor distribuite; nu certifică validitatea unei ipoteze științifice.

<!-- page -->

# 11. Experimentele necesare înainte de a extinde promisiunile

Criteriile următoare sunt propuneri pentru experimente noi, nu rezultate deja obținute. Protocolul și pragurile trebuie fixate înainte de inspectarea testului final. Un eșec respinge afirmația testată, nu întregul proiect.

## A. Învățarea regulilor de tranziție direct ca programe SOP

**Intrare:** numai triplete `(stare înainte, eveniment, stare după)`, inclusiv acțiuni blocate. Mecanismul nu are acces la programele `knowledge/transitions/model*` și nici la evaluator. Primește doar primitive generice.

**Experiment:** generează stările din aceeași lume mică, dar antrenează pe un subset separat. Schimbă identificatorii în test. Caută programe care leagă persoana, obiectul și locul, detectează absența posesiei și emit efectul potrivit.

**Criteriu local:** programul generat trebuie să treacă toate cele 7.168 de cazuri finite, plus redenumiri și perturbări de roluri, fără reguli de domeniu ascunse în MJS. Raportează candidații încercați, memoria, timpul și mărimea programelor. O singură tranziție greșită respinge corectitudinea exhaustivă; creșterea aproape unu-la-unu a programelor cu episoadele respinge compresia revendicată pentru acel set.

## B. Căutarea numerică pe exemple insuficient variate

**Intrare:** contraexemplul cu zero din audit, urmat de seturi cu constante, corelații accidentale și exemple care disting candidații. Păstrează `(a+b)*(a+b)` ca martor executabil.

**Experiment:** compară deduplicarea actuală cu o variantă care păstrează candidați indistincți pe antrenare, dar relevanți pentru selecție. Adaugă expresii țintă diferite și intrări finale în afara intervalului folosit la căutare.

**Criteriu local:** dispariția contraexemplului fără pierderea testelor finale existente. Măsoară costul suplimentar. Dacă îmbunătățirea cere păstrarea aproape tuturor candidaților, problema de scalare rămâne, chiar dacă exemplul mic este reparat.

## C. Interpretarea textului fără confundarea rolurilor

**Intrare:** propoziții pereche care diferă numai prin negare, timp, diateză sau pronume, de exemplu `Alice took book.` / `Alice did not take book.`. Include contextul care stabilește referentul unui pronume și cazuri în care referentul rămâne ambiguu.

**Experiment:** separă două trasee. În primul, un convertor extern produce episoade structurate și îi măsori separat erorile. În al doilea, parserul SOP produce interpretările. Convertorul nu are voie să furnizeze regulile generale pe care pretinzi că le învață sistemul.

**Criteriu propus:** set final blocat, scris independent de autorul gramaticii; cel puțin 90% interpretări exacte între răspunsurile date, cel mult 20% abțineri din întregul set și zero transformări afirmative greșite în setul de negare. Pragurile sunt decizii de experiment, nu legi generale. Raportează separat erorile semantice, abținerile și rata de acoperire.

<!-- page -->

# 12. Experimentele de scalare și integrare

## D. Recuperare de circuite la scară

Construiește biblioteci de 1.000, 10.000 și 100.000 de circuite cu structuri diferite, nu doar aceeași regulă redenumită. Compară hash/index inversat, indexare de termeni sau discrimination tree, ANN/HNSW pe reprezentări structurale și semnături VSA. Toate primesc aceleași surse și interogări exacte, incomplete sau cu câmpuri greșite.

Măsoară separat construcția indexului, actualizarea, RAM-ul procesului, latența mediană și percentila 95, recuperarea regulii necesare în primele 32 de candidate și corectitudinea după verificarea SOP. Pentru a separa reprezentarea de indexul aproximativ, include și căutare vectorială exhaustivă pe aceleași reprezentări. Un criteriu propus este recuperare de cel puțin 99,9% pe setul final; o metodă rapidă care omite reguli necesare nu este echivalentă cu una exactă.

## E. Compoziție între familii și efecte care se schimbă în timp

Folosește grafuri cu ramificații, cicluri și minimum zece familii relaționale, apoi combinații care nu au apărut la antrenare. Include fapte retractate și situații în care aceeași entitate își schimbă locația. Compară cu un evaluator independent, nu cu aceeași închidere SOP folosită pentru predicție.

Criteriul pentru subdomeniile finite este egalitatea tuturor răspunsurilor, nu numai a unor întrebări favorabile. Înregistrează separat opririle din lipsă de buget. Dacă regulile corecte există, dar nu pot fi compuse în bugetul prestabilit, rezultatul validează reprezentarea, nu eficiența raționamentului.

## F. Stare, dependențe și contradicții

Adaugă un validator al invariatelor și teste cu două locații simultane, efecte incompatibile și dovezi incomplete. Pentru reluare, fixează sursele dependente, primitivele și datele. Contraexemplul cu subcircuitul care trece de la `1` la `2` trebuie să fie fie blocat, fie reprodus folosind dependența fixată.

Criteriul este refuzul sau tratarea explicită a fiecărei contradicții din setul prestabilit, fără eliminarea tacită a unei surse. Reactivarea unui program nu trebuie confundată cu învățarea unei reguli noi despre lume.

## G. Răspunsuri și continuări dincolo de șabloane

Pentru rezumare, folosește texte sau episoade cu fapte importante și secundare. Cere păstrarea faptelor obligatorii, nu reproducerea întregii diferențe de stare. Pentru continuare, include mai multe rezultate legitime și argumente noi: destinații, obiecte și acțiuni care trebuie propuse sub constrângeri.

Măsoară factualitatea, acoperirea, repetarea și varietatea, separat de fluență. Dacă revendici un model probabilistic de limbaj, trebuie definită și evaluată o distribuție normalizată a continuărilor pe un corpus separat; cele 1.000 de continuări deterministe nu o înlocuiesc. Nu numi „raționament” alegerea unui rezultat arbitrar când intrarea permite mai multe.

**Ordinea recomandată:** repararea limitelor de validare și căutare, inducția tranzițiilor, interpretarea controlată, apoi scalarea și generarea mai largă. Fiecare etapă trebuie să adauge un comportament verificabil, nu doar un nume nou de componentă.
