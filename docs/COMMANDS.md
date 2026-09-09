# Catalogul comenzilor

Generat din fișierele active, nu dintr-o listă de capabilități dorite. „MJS” indică implementare nativă generică; „SOP” indică un program compus. Ambele folosesc același nume de apel derivat din cale. Un `?` în contractul MJS de mai jos marchează un argument opțional în metadatele native; nu este sintaxă de variabilă logică în SOP. `arg*` înseamnă argumente numerotate arg0, arg1 etc.

| Comandă | Implementare | Contract / subcomenzi directe |
|---|---|---|
| bindings.unit | MJS | fără argumente |
| collection.map | MJS | items command * |
| collection.requireNonEmpty | MJS | items |
| collection.requireSameSize | MJS | items reference |
| data.choose | MJS | condition yes no |
| data.fact | MJS | name arg* |
| data.flatten | MJS | items |
| data.get | MJS | source key |
| data.identity | MJS | value |
| data.one | MJS | items |
| data.prepend | MJS | value items |
| data.record | MJS | * |
| data.resolve | MJS | candidates supported |
| data.sequence | MJS | arg* |
| data.unique | MJS | items |
| data.with | MJS | source * |
| effect.add | SOP | input, data.with, program.call |
| effect.emit | MJS | rows name sign arg* |
| effect.remove | SOP | input, data.with, program.call |
| frame.event | SOP | input, data.get, data.sequence |
| frame.state | SOP | input, data.get |
| generated.completion.family0 | SOP | input, logic.variable, data.get, bindings.unit, relation.join, rows.project |
| generated.completion.family1 | SOP | input, logic.variable, data.get, bindings.unit, relation.join, rows.project |
| generated.completion.family2 | SOP | input, logic.variable, data.get, bindings.unit, relation.join, rows.project |
| generated.completion.family3 | SOP | input, logic.variable, data.get, bindings.unit, relation.join, rows.project |
| generated.completion.unbound | SOP | input, logic.variable, data.get, bindings.unit, relation.join, rows.project |
| generated.numeric.seed17task0 | SOP | input, data.get, number.add, data.identity |
| generated.numeric.seed17task1 | SOP | input, data.get, number.multiply, number.add, data.identity |
| generated.numeric.seed17task2 | SOP | input, data.get, number.add, number.multiply, data.identity |
| generated.numeric.seed29task0 | SOP | input, data.get, number.add, data.identity |
| generated.numeric.seed29task1 | SOP | input, data.get, number.multiply, number.add, data.identity |
| generated.numeric.seed29task2 | SOP | input, data.get, number.add, number.multiply, data.identity |
| generated.numeric.seed41task0 | SOP | input, data.get, number.add, data.identity |
| generated.numeric.seed41task1 | SOP | input, data.get, number.multiply, number.add, data.identity |
| generated.numeric.seed41task2 | SOP | input, data.get, number.add, number.multiply, data.identity |
| input | MJS | fără argumente |
| knowledge.ancestor.direct | SOP | input, data.get, logic.variable, bindings.unit, relation.join, rows.project |
| knowledge.ancestor.transitive | SOP | input, data.get, logic.variable, bindings.unit, relation.join, rows.project |
| knowledge.episodes.initial | SOP | input, text, data.fact, data.sequence, data.record |
| knowledge.transitions | SOP | input, data.sequence |
| knowledge.transitions.model101.drop.r000 | SOP | input, frame.event, frame.state, logic.variable, bindings.unit, relation.join, effect.remove, value.identity |
| knowledge.transitions.model101.give.r001 | SOP | input, frame.event, frame.state, logic.variable, bindings.unit, relation.join, relation.absent, effect.remove, value.identity |
| knowledge.transitions.model101.give.r002 | SOP | input, frame.event, frame.state, logic.variable, bindings.unit, relation.join, effect.add, value.identity |
| knowledge.transitions.model101.take.r003 | SOP | input, frame.event, frame.state, logic.variable, bindings.unit, relation.join, relation.absent, effect.add, value.identity |
| knowledge.transitions.model101.travel.r004 | SOP | input, frame.event, frame.state, logic.variable, bindings.unit, relation.join, logic.notEqual, effect.remove, value.identity |
| knowledge.transitions.model101.travel.r005 | SOP | input, frame.event, frame.state, logic.variable, bindings.unit, relation.join, logic.notEqual, effect.remove, value.identity |
| knowledge.transitions.model101.travel.r006 | SOP | input, frame.event, frame.state, logic.variable, bindings.unit, relation.join, logic.notEqual, effect.add, value.identity |
| knowledge.transitions.model101.travel.r007 | SOP | input, frame.event, frame.state, logic.variable, bindings.unit, relation.join, effect.add, value.identity |
| knowledge.transitions.model202.drop.r000 | SOP | input, frame.event, frame.state, logic.variable, bindings.unit, relation.join, effect.remove, value.identity |
| knowledge.transitions.model202.give.r001 | SOP | input, frame.event, frame.state, logic.variable, bindings.unit, relation.join, relation.absent, effect.remove, value.identity |
| knowledge.transitions.model202.give.r002 | SOP | input, frame.event, frame.state, logic.variable, bindings.unit, relation.join, effect.add, value.identity |
| knowledge.transitions.model202.take.r003 | SOP | input, frame.event, frame.state, logic.variable, bindings.unit, relation.join, relation.absent, effect.add, value.identity |
| knowledge.transitions.model202.travel.r004 | SOP | input, frame.event, frame.state, logic.variable, bindings.unit, relation.join, logic.notEqual, effect.remove, value.identity |
| knowledge.transitions.model202.travel.r005 | SOP | input, frame.event, frame.state, logic.variable, bindings.unit, relation.join, logic.notEqual, effect.remove, value.identity |
| knowledge.transitions.model202.travel.r006 | SOP | input, frame.event, frame.state, logic.variable, bindings.unit, relation.join, logic.notEqual, effect.add, value.identity |
| knowledge.transitions.model202.travel.r007 | SOP | input, frame.event, frame.state, logic.variable, bindings.unit, relation.join, effect.add, value.identity |
| knowledge.transitions.model303.drop.r000 | SOP | input, frame.event, frame.state, logic.variable, bindings.unit, relation.join, effect.remove, value.identity |
| knowledge.transitions.model303.give.r001 | SOP | input, frame.event, frame.state, logic.variable, bindings.unit, relation.join, relation.absent, effect.remove, value.identity |
| knowledge.transitions.model303.give.r002 | SOP | input, frame.event, frame.state, logic.variable, bindings.unit, relation.join, effect.add, value.identity |
| knowledge.transitions.model303.take.r003 | SOP | input, frame.event, frame.state, logic.variable, bindings.unit, relation.join, relation.absent, effect.add, value.identity |
| knowledge.transitions.model303.travel.r004 | SOP | input, frame.event, frame.state, logic.variable, bindings.unit, relation.join, logic.notEqual, effect.remove, value.identity |
| knowledge.transitions.model303.travel.r005 | SOP | input, frame.event, frame.state, logic.variable, bindings.unit, relation.join, logic.notEqual, effect.remove, value.identity |
| knowledge.transitions.model303.travel.r006 | SOP | input, frame.event, frame.state, logic.variable, bindings.unit, relation.join, logic.notEqual, effect.add, value.identity |
| knowledge.transitions.model303.travel.r007 | SOP | input, frame.event, frame.state, logic.variable, bindings.unit, relation.join, effect.add, value.identity |
| knowledge.transitions.model404.drop.r000 | SOP | input, frame.event, frame.state, logic.variable, bindings.unit, relation.join, effect.remove, value.identity |
| knowledge.transitions.model404.give.r001 | SOP | input, frame.event, frame.state, logic.variable, bindings.unit, relation.join, relation.absent, effect.remove, value.identity |
| knowledge.transitions.model404.give.r002 | SOP | input, frame.event, frame.state, logic.variable, bindings.unit, relation.join, effect.add, value.identity |
| knowledge.transitions.model404.take.r003 | SOP | input, frame.event, frame.state, logic.variable, bindings.unit, relation.join, relation.absent, effect.add, value.identity |
| knowledge.transitions.model404.travel.r004 | SOP | input, frame.event, frame.state, logic.variable, bindings.unit, relation.join, logic.notEqual, effect.remove, value.identity |
| knowledge.transitions.model404.travel.r005 | SOP | input, frame.event, frame.state, logic.variable, bindings.unit, relation.join, logic.notEqual, effect.remove, value.identity |
| knowledge.transitions.model404.travel.r006 | SOP | input, frame.event, frame.state, logic.variable, bindings.unit, relation.join, logic.notEqual, effect.add, value.identity |
| knowledge.transitions.model404.travel.r007 | SOP | input, frame.event, frame.state, logic.variable, bindings.unit, relation.join, effect.add, value.identity |
| knowledge.transitions.model505.drop.r000 | SOP | input, frame.event, frame.state, logic.variable, bindings.unit, relation.join, effect.remove, value.identity |
| knowledge.transitions.model505.give.r001 | SOP | input, frame.event, frame.state, logic.variable, bindings.unit, relation.join, relation.absent, effect.remove, value.identity |
| knowledge.transitions.model505.give.r002 | SOP | input, frame.event, frame.state, logic.variable, bindings.unit, relation.join, effect.add, value.identity |
| knowledge.transitions.model505.take.r003 | SOP | input, frame.event, frame.state, logic.variable, bindings.unit, relation.join, relation.absent, effect.add, value.identity |
| knowledge.transitions.model505.travel.r004 | SOP | input, frame.event, frame.state, logic.variable, bindings.unit, relation.join, logic.notEqual, effect.remove, value.identity |
| knowledge.transitions.model505.travel.r005 | SOP | input, frame.event, frame.state, logic.variable, bindings.unit, relation.join, logic.notEqual, effect.remove, value.identity |
| knowledge.transitions.model505.travel.r006 | SOP | input, frame.event, frame.state, logic.variable, bindings.unit, relation.join, logic.notEqual, effect.add, value.identity |
| knowledge.transitions.model505.travel.r007 | SOP | input, frame.event, frame.state, logic.variable, bindings.unit, relation.join, effect.add, value.identity |
| language.ambiguity.instrument | SOP | input, data.get, text.tokenize, data.prepend, data.sequence, logic.variable, bindings.unit, relation.join, rows.project |
| language.ambiguity.modifier | SOP | input, data.get, text.tokenize, data.prepend, data.sequence, logic.variable, bindings.unit, relation.join, rows.project |
| language.apply | SOP | input, data.get, data.record, program.call |
| language.grammar.drop1 | SOP | input, data.get, text.tokenize, data.prepend, data.sequence, logic.variable, bindings.unit, relation.join, rows.project |
| language.grammar.drop2 | SOP | input, data.get, text.tokenize, data.prepend, data.sequence, logic.variable, bindings.unit, relation.join, rows.project |
| language.grammar.extension | SOP | input, data.get, text.tokenize, data.prepend, data.sequence, logic.variable, bindings.unit, relation.join, rows.project |
| language.grammar.give1 | SOP | input, data.get, text.tokenize, data.prepend, data.sequence, logic.variable, bindings.unit, relation.join, rows.project |
| language.grammar.give2 | SOP | input, data.get, text.tokenize, data.prepend, data.sequence, logic.variable, bindings.unit, relation.join, rows.project |
| language.grammar.inspect1 | SOP | input, data.get, text.tokenize, data.prepend, data.sequence, logic.variable, bindings.unit, relation.join, rows.project |
| language.grammar.store1 | SOP | input, data.get, text.tokenize, data.prepend, data.sequence, logic.variable, bindings.unit, relation.join, rows.project |
| language.grammar.take1 | SOP | input, data.get, text.tokenize, data.prepend, data.sequence, logic.variable, bindings.unit, relation.join, rows.project |
| language.grammar.take2 | SOP | input, data.get, text.tokenize, data.prepend, data.sequence, logic.variable, bindings.unit, relation.join, rows.project |
| language.grammar.take3 | SOP | input, data.get, text.tokenize, data.prepend, data.sequence, logic.variable, bindings.unit, relation.join, rows.project |
| language.grammar.travel1 | SOP | input, data.get, text.tokenize, data.prepend, data.sequence, logic.variable, bindings.unit, relation.join, rows.project |
| language.grammar.travel2 | SOP | input, data.get, text.tokenize, data.prepend, data.sequence, logic.variable, bindings.unit, relation.join, rows.project |
| language.grammar.travel3 | SOP | input, data.get, text.tokenize, data.prepend, data.sequence, logic.variable, bindings.unit, relation.join, rows.project |
| language.parse | SOP | input, data.get, data.sequence, collection.map, data.flatten, data.unique |
| language.render.atAdded | SOP | input, data.get, logic.variable, bindings.unit, relation.join, rows.map |
| language.render.atRemoved | SOP | input, data.get, logic.variable, bindings.unit, relation.join, rows.map |
| language.render.holdsAdded | SOP | input, data.get, logic.variable, bindings.unit, relation.join, rows.map |
| language.render.holdsRemoved | SOP | input, data.get, logic.variable, bindings.unit, relation.join, rows.map |
| language.say.atAdded | SOP | input, data.get, text |
| language.say.atRemoved | SOP | input, data.get, text |
| language.say.holdsAdded | SOP | input, data.get, text |
| language.say.holdsRemoved | SOP | input, data.get, text |
| language.support.instrument | SOP | input, data.get, logic.variable, bindings.unit, relation.join, rows.project |
| language.support.modifier | SOP | input, data.get, logic.variable, bindings.unit, relation.join, rows.project |
| learning.numeric | SOP | input, data.get, data.sequence, program.synthesize |
| logic.equal | MJS | rows left right |
| logic.notEqual | MJS | rows left right |
| logic.variable | MJS | fără argumente |
| number.add | MJS | left right |
| number.multiply | MJS | left right |
| number.subtract | MJS | left right |
| program.abstract | MJS | sources |
| program.apply | SOP | input, data.get, program.call |
| program.call | MJS | command arguments |
| program.inspect | MJS | reference |
| program.retrieve | MJS | names terms |
| program.synthesize | MJS | training validation operations maxNodes maxCandidates |
| relation.absent | MJS | rows facts name coverage? arg* |
| relation.join | MJS | rows facts name arg* |
| rows.map | MJS | rows command * |
| rows.project | MJS | rows name arg* |
| state.apply | MJS | before effects |
| state.close | MJS | facts commands maxRounds? |
| state.difference | MJS | before after |
| tasks.advance | SOP | input, data.get, data.sequence, knowledge.transitions, program.retrieve, collection.requireNonEmpty, collection.map, data.flatten, state.apply, data.record |
| tasks.ambiguity | SOP | input, data.get, language.ambiguity.instrument, language.ambiguity.modifier, data.sequence, data.flatten, language.support.instrument, language.support.modifier, data.resolve |
| tasks.ancestors | SOP | input, data.get, data.sequence, state.close |
| tasks.respond | SOP | input, data.get, language.parse, data.one, tasks.advance, tasks.summarize, data.record |
| tasks.summarize | SOP | input, data.get, state.difference, language.render.atAdded, language.render.atRemoved, language.render.holdsAdded, language.render.holdsRemoved, data.sequence, data.flatten, collection.requireSameSize, text.join |
| text | MJS | raw multiline text with $ interpolation |
| text.join | MJS | items separator? |
| text.tokenize | MJS | text |
| value.identity | SOP | input, data.get |
