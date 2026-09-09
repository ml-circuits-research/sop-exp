# Lucrul în acest pachet

## Înainte de modificare

Rulează `node reproduce.mjs` din rădăcină. Citește `docs/GHID.md` și `results/audit.json`. Cele opt limite reproduse nu sunt competențe rezolvate. Nu transforma o limită într-un rezultat pozitiv schimbând doar descrierea sau așteptarea testului.

## Ce este sursă și ce este rezultat

`src/` și comenzile `.mjs` implementează mecanisme generice. Comenzile `.sop` exprimă operațiile compuse, cunoașterea și tiparele de limbaj. Numele de comandă este calea relativă la `commands/`, cu puncte în locul separatorilor și fără extensie. Nu crea un evaluator paralel pentru reguli de domeniu într-un obiect JSON sau într-un DSL ascuns.

Fișierele `knowledge/transitions/model*` sunt intrări fixe ale experimentului. Nu raporta executarea lor ca învățare. Fișierele `generated/` sunt regenerabile din experimente. Gramatica este scrisă manual. Adăugarea unei construcții într-un fișier nu o înscrie automat în lista `language.parse`.

## Cum se susține un rezultat

Păstrează separat demonstrațiile executabile, datele folosite la căutare și testul final. La sinteza numerică, câmpul `validation` participă la alegerea programului; nu este testul final independent. Notează numărul de tipare distincte, nu numai numărul de nume schimbate.

Orice afirmație nouă trebuie să indice un script de rulare, exemple concrete, rezultatul așteptat, rezultatul obținut și un contraexemplu care ar invalida-o. Salvează înregistrările detaliate, nu doar totalurile. Nu șterge cazuri dificile după ce ai văzut rezultatele. Schimbarea protocolului trebuie explicată în descrierea curentă a experimentului, fără a prezenta scorurile ca direct comparabile dacă protocolul diferă.

Un test `LIMIT:` verifică prezența unei deficiențe cunoscute. Când o repari, înlocuiește-l cu un test al comportamentului dorit, actualizează `audit.mjs`, documentația și verificatorul. Nu păstra `capabilityMet:false` dacă funcționalitatea a fost demonstrabil reparată; nu îl pune pe `true` doar pentru a obține un raport verde.

## Verificare și livrare

`verify.mjs` nu trebuie să reconstruiască manifestul. Manifestul fixează codul, datele, sursele generate și documentația; `results/` este regenerabil. După modificări deliberate, rulează separat testele, experimentele, auditul și verificarea izolată, regenerează documentația, apoi folosește explicit `node tools/manifest.mjs` ca operație de împachetare. Rulează din nou `node reproduce.mjs` pe ZIP-ul extras.

Mecanismul de activare cere cel puțin un exemplu de verificare; aceasta previne validarea vidă, nu garantează suficiența testelor. Producătorii și hash-urile din trace nu sunt dovezi despre adevărul lumii. Bugetele sunt cooperative. Modulele native sunt cod de încredere; izolarea procesului rămâne responsabilitatea aplicației care integrează runtime-ul.

Documentația principală are o singură sursă, `docs/GHID.md`. `tools/build_docx.py` o transpune în DOCX. Rularea experimentelor nu depinde de Python sau de regenerarea documentului. La livrare păstrează DOCX în ZIP și oferă-l și separat.
