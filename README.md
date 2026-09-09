# SOP — experimente executabile și rezultate

**Ce este aici:** un runtime care execută programe SOP, o bibliotecă mică de operații pe fapte și două mecanisme limitate care produc programe SOP noi. Nu este un model general de limbaj. Nu învață regulile lumii din text liber.

**Ce merită reținut:** din trei demonstrații SOP cu aceeași structură, mecanismul de abstracție poate produce un program care funcționează și pentru alte nume. Separat, căutarea numerică găsește programe mici din exemple de intrare/ieșire. Acestea sunt cele două rezultate de învățare. Executarea regulilor de mișcare și recunoașterea frazelor folosesc programe deja furnizate.

## Începe cu un rezultat vizibil

Este verificat cu Node.js 22.16.0, Linux x64. Execuția nu cere pachete npm, rețea, model neural, VSA sau chei API. Toate comenzile se rulează din acest director.

```bash
node demo.mjs
```

Cu `Alice` și `book` în `lab`, intrarea `Alice picked up book.` produce faptul `holds(Alice, book)` și textul `Alice now holds book.`. Apoi demonstrația mută persoana cu obiectul, lasă obiectul, execută un program învățat și arată două limite.

**Contraexemplu important:** `She picked up book.` nu rezolvă pronumele. Produce evenimentul `take(She, book)` și, în starea din exemplu, un rezultat `complete` fără schimbare. Așadar, nici măcar toate intrările lingvistice nesuportate nu sunt refuzate sigur.

## Reproduce verificarea completă

```bash
node reproduce.mjs
```

Această comandă verifică fișierele, rulează testele, recalculează experimentele, reproduce contraexemplele și verifică rezultatele. O etapă cu eroare oprește rularea. Nu executa `tools/manifest.mjs` înainte de verificare: acel utilitar reconstruiește referința de integritate, nu verifică distribuția primită.

```bash
node audit.mjs        # Exemple concrete cu limitele cunoscute
node verify.mjs       # Verifică dovezile salvate; nu reface predicțiile
node cli.mjs tasks.respond --input examples/request.json --trace
```

## Ce înseamnă numerele

| Rezultat observat | Interpretarea corectă |
|---|---|
| 4.800/4.800 tranziții; 7.168/7.168 cazuri într-o lume mică | Programele de tranziție furnizate se execută corect în cazurile testate. Nu se reînvață în această rulare. |
| 1.000/1.000 continuări | Patru tipare de evenimente, generalizate din demonstrații SOP aliniate, funcționează pentru identificatori noi. Nu este predicție liberă de text. |
| 1.800/1.800 evaluări numerice | Trei funcții mici, trei împărțiri ale datelor și 200 de teste finale per rulare. Nu sunt 1.800 de programe diferite. |
| 1.200/1.200 propoziții | Douăsprezece tipare scrise manual, fiecare cu 100 de variații ale numelor. Nu sunt 1.200 de structuri lingvistice. |
| 500/500 verbalizări | Se reconstruiește diferența factuală dintre două stări. Nu se rezumă documente. |
| 68/68 teste de regresie | Verifică mecanica, refuzurile și reproducerea unor limite. Nu înseamnă 68 de competențe reușite. |

Nu aduna aceste rezultate într-un procent global. Nu se testează același lucru, iar numeroase cazuri sunt variații ale aceluiași tipar.

## Unde găsești explicațiile

`docs/GHID.md` și `docs/SOP_Ghid_Experiment.docx` explică fiecare rezultat, cu intrare, ieșire, verificare și limită. `docs/SOP_REFERENCE.md` descrie sintaxa executată. `docs/COMMANDS.md` este catalogul generat din fișiere. `AGENTS.md` spune cum se modifică pachetul fără a ascunde schimbări de protocol.

`results/summary.json` conține măsurătorile. `results/audit.json` păstrează separat **opt limite reproduse**, fiecare cu rezultatul efectiv și rezultatul dorit. Fișierele `*-records.json` păstrează intrări, ieșiri și așteptări pentru inspectarea experimentelor. `results/verification.json` enumeră verificările efectuate.

## Ce se construiește și ce nu

`commands/knowledge/transitions/model*/` conține cinci seturi furnizate de câte opt programe. `run-all.mjs` le testează; nu le antrenează. `commands/generated/completion/` și `commands/generated/numeric/` conțin programe generate de experimente; acestea sunt reconstruite la rulare. Construcțiile din `commands/language/grammar/` sunt scrise manual.

Ținta cercetării este ca aceeași cale — observații, program SOP candidat, teste separate, integrare în bibliotecă — să funcționeze pentru operații mai bogate și pentru texte. Pachetul nu demonstrează încă această extindere. Nu s-a dovedit imposibil un model simbolic de limbaj; s-au identificat limite concrete ale mecanismelor testate.
