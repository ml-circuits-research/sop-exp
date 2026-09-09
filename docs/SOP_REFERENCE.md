# Sintaxa SOP executată de acest runtime

Acest document descrie contractul codului livrat. Compatibilitatea cu un runtime SOP extern nu a fost testată. Exemplele de aici nu sunt o declarație că toate facilitățile SOP Lang sunt implementate.

## Modul și apel

```sop
@input input
@a data.get source $input key "a"
@b data.get source $input key "b"
@output number.add left $a right $b
```

Apelul cu `{ "a": 4, "b": 3 }` întoarce `7`. `@input input` primește argumentele, iar valoarea lui `@output` este rezultatul. Fiecare nume are un singur producător. `$a` consumă o valoare; dependențele determină ordinea de execuție. O referință poate apărea textual înaintea producătorului. Producătorii dubli, referințele lipsă și ciclurile dintre declarațiile aceluiași modul sunt erori.

Declarația continuă până la următorul antet `@nume comandă`. Nu există punct de terminare. Un punct izolat este o valoare sau un argument suplimentar, nu terminator. Comentariile încep cu `#` pe o linie separată. Majoritatea comenzilor folosesc argumente numite în perechi `nume valoare`; acestea pot fi repartizate pe mai multe linii.

`commands/number/add.mjs` este comanda `number.add`. `commands/language/say/holdsAdded.sop` este comanda `language.say.holdsAdded`. Apelul nu diferențiază implementarea nativă de compoziția SOP. Două fișiere cu aceeași cale fără extensie produc o coliziune și sunt respinse.

## Valorile și datele

Sunt acceptate șiruri în ghilimele duble, numere zecimale, booleeni și `null`. Argumentele neîncadrate în ghilimele pot fi atomi textuali; pentru cunoaștere și identificatori este mai clar să folosești ghilimele. Identificatorii de declarații și segmentele căilor folosesc litere ASCII, cifre și underscore, fără cifră inițială.

Obiectele JSON de la CLI sunt date de intrare, nu programe de reguli. Un fapt precum `["at", "Alice", "lab"]` este un tuplu. Operația `data.fact` poate construi același tuplu în SOP; `data.sequence` construiește o colecție, iar `data.record` un obiect cu câmpuri. `arg0`, `arg1` etc. sunt ordonate numeric de primitivele care le acceptă.

## Variabile logice

```sop
@input input
@facts data.get source $input key "facts"
@person logic.variable
@seed bindings.unit
@rows relation.join
  rows $seed facts $facts name "at"
  arg0 $person arg1 "lab"
@output rows.project rows $rows name "present" arg0 $person
```

Cu `facts = [["at","Alice","lab"],["at","Bob","office"]]`, rezultatul este `[["present","Alice"]]`. `$person` transportă un loc logic de legat, nu un nume magic de persoană. `relation.join` produce rânduri de legări; reutilizarea aceluiași loc în două potriviri impune aceeași valoare. Nu există o a doua sintaxă `?Person`.

`relation.absent` nu poate concluziona în general că lipsa unui fapt înseamnă falsitate. Cere o declarație `coverage` aplicabilă aceleiași fotografii a faptelor atunci când nu găsește un martor. Aplicația furnizează această declarație; runtime-ul nu poate verifica dacă aplicația cunoaște întreaga lume.

## Referință de execuție

```sop
@input input
@answer data.identity value 7
@output program.inspect reference ~answer
```

`~answer` transmite o vedere nemodificabilă cu valoare, producător, modul, hash de sursă, epocă și dependențe. Nu este o variabilă modificabilă, un pointer către o operație încă neexecutată sau o dovadă completă cu surse textuale. `$answer` ar transmite numai valoarea.

## Text

```sop
@input input
@person data.get source $input key "person"
@object data.get source $input key "object"
@output text
$person now holds $object.
```

`text` consumă corpul textual și interpolează scalari. `$$` produce un dolar literal. Inserarea unei valori textuale nu reparsază acea valoare ca program SOP. Obiectele și colecțiile nu sunt interpolate tacit. Ghilimelele trebuie să fie bine formate; o linie care începe ca o declarație este tratată ca declarație. Nu este încă un editor general de proză.

## Rezultate și erori

`Runtime.run()` execută sau aruncă o eroare. `Runtime.attempt()` transformă lipsa justificării pentru absență, ieșirile nelegate și epuizarea bugetului în `{status:"unknown", reason:...}`. Erorile de programare, cum ar fi un argument obligatoriu lipsă, rămân erori.

`complete` înseamnă că execuția s-a încheiat. Nu garantează că intrarea descrie corect lumea. `tasks.ambiguity` poate produce o valoare cu `status:"ambiguous"` în interiorul unui rezultat de execuție `complete`. O acțiune cunoscută dar blocată poate produce o stare neschimbată și text gol. Un eveniment fără circuit disponibil produce `unknown`.

La CLI, codul de ieșire este `0` pentru execuție completă, `2` pentru `unknown`, `1` pentru eroare. Bugetele de lucru și adâncime sunt cooperative, nu limite stricte de timp sau memorie. Nu există o distribuție probabilistică de tokeni, beam search general sau un mecanism de antrenare a întregului runtime.

## Contracte de implementare de reținut

`state.apply` aplică eliminările și apoi adăugările; o adăugare a aceluiași fapt prevalează. Nu există arbitraj general al contradicțiilor. `state.close` repetă programele furnizate până când nu mai apar fapte noi sau este atinsă limita. Un ciclu de fapte nu este același lucru cu un ciclu de dependențe între declarații.

`SourceIndex` indexează tokeni și apeluri statice din sursele selectate. `program.retrieve` reconstruiește indexul la apel. `assertFresh()` este disponibil pentru indexuri reutilizate, dar trebuie apelat explicit. Niciuna dintre acestea nu este un motor semantic pentru întrebări libere.

Nu sunt implementate aici alternativele de comandă cu `|`, facilități generale macro/reactive, traducerea automată a limbajului natural în SOP sau un compilator optimizant. Extensibilitatea sintactică nu demonstrează că mecanismul de învățare știe să folosească o comandă nouă.
