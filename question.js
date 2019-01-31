const questions = [
  {
    question: 'あきのたの　かりほのいほの　とまをあらみ',
    choices: [],
    answer: 'わがころもでは　つゆにぬれつつ',
  },
  {
    question: 'はるすぎて　なつきにけらし　しろたへの',
    choices: [],
    answer: 'ころもほすてふ　あまのかぐやま',
  },
  {
    question: 'あしびきの　やまどりのをの　しだりをの',
    choices: [],
    answer: 'ながながしよを　ひとりかもねむ',
  },
  {
    question: 'たごのうらに　うちいでてみれば　しろたへの',
    choices: [],
    answer: 'ふじのたかねに　ゆきはふりつつ',
  },
  {
    question: 'おくやまに　もみぢふみわけ　なくしかの',
    choices: [],
    answer: 'こゑきくときぞ　あきはかなしき',
  },
  {
    question: 'かささぎの　わたせるはしに　おくしもの',
    choices: [],
    answer: 'しろきをみれば　よぞふけにける',
  },
  {
    question: 'あまのはら　ふりさけみれば　かすがなる',
    choices: [],
    answer: 'みかさのやまに　いでしつきかも',
  },
  {
    question: 'わがいほは　みやこのたつみ　しかぞすむ',
    choices: [],
    answer: 'よをうぢやまと　ひとはいふなり',
  },
  {
    question: 'はなのいろは　うつりにけりな　いたづらに',
    choices: [],
    answer: 'わがみよにふる　ながめせしまに',
  },
  {
    question: 'これやこの　ゆくもかへるも　わかれては',
    choices: [],
    answer: 'しるもしらぬも　あふさかのせき',
  },
  {
    question: 'わたのはら　やそしまかけて　こぎいでぬと',
    choices: [],
    answer: 'ひとにはつげよ　あまのつりぶね',
  },
  {
    question: 'あまつかぜ　くものかよひぢ　ふきとぢよ',
    choices: [],
    answer: 'をとめのすがた　しばしとどめむ',
  },
  {
    question: 'つくばねの　みねよりおつる　みなのがは',
    choices: [],
    answer: 'こひぞつもりて　ふちとなりぬる',
  },
  {
    question: 'みちのくの　しのぶもぢずり　たれゆゑに',
    choices: [],
    answer: 'みだれそめにし　われならなくに',
  },
  {
    question: 'きみがため　はるののにいでて　わかなつむ',
    choices: [],
    answer: 'わがころもでに　ゆきはふりつつ',
  },
  {
    question: 'たちわかれ　いなばのやまの　みねにおふる',
    choices: [],
    answer: 'まつとしきかば　いまかへりこむ',
  },
  {
    question: 'ちはやぶる　かみよもきかず　たつたがは',
    choices: [],
    answer: 'からくれなゐに　みづくくるとは',
  },
  {
    question: 'すみのえの　きしによるなみ　よるさへや',
    choices: [],
    answer: 'ゆめのかよひぢ　ひとめよくらむ',
  },
  {
    question: 'なにはがた　みじかきあしの　ふしのまも',
    choices: [],
    answer: 'あはでこのよを　すぐしてよとや',
  },
  {
    question: 'わびぬれば　いまはたおなじ　なにはなる',
    choices: [],
    answer: 'みをつくしても　あはむとぞおもふ',
  },
  {
    question: 'いまこむと　いひしばかりに　ながつきの',
    choices: [],
    answer: 'ありあけのつきを　まちいでつるかな',
  },
  {
    question: 'ふくからに　あきのくさきの　しをるれば',
    choices: [],
    answer: 'むべやまかぜを　あらしといふらむ',
  },
  {
    question: 'つきみれば　ちぢにものこそ　かなしけれ',
    choices: [],
    answer: 'わがみひとつの　あきにはあらねど',
  },
  {
    question: 'このたびは　ぬさもとりあへず　たむけやま',
    choices: [],
    answer: 'もみぢのにしき　かみのまにまに',
  },
  {
    question: 'なにしおはば　あふさかやまの　さねかづら',
    choices: [],
    answer: 'ひとにしられで　くるよしもがな',
  },
  {
    question: 'をぐらやま　みねのもみぢば　こころあらば',
    choices: [],
    answer: 'いまひとたびの　みゆきまたなむ',
  },
  {
    question: 'みかのはら　わきてながるる　いづみがは',
    choices: [],
    answer: 'いつみきとてか　こひしかるらむ',
  },
  {
    question: 'やまざとは　ふゆぞさびしさ　まさりける',
    choices: [],
    answer: 'ひとめもくさも　かれぬとおもへば',
  },
  {
    question: 'こころあてに　をらばやをらむ　はつしもの',
    choices: [],
    answer: 'おきまどはせる　しらぎくのはな',
  },
  {
    question: 'ありあけの　つれなくみえし　わかれより',
    choices: [],
    answer: 'あかつきばかり　うきものはなし',
  },
  {
    question: 'あさぼらけ　ありあけのつきと　みるまでに',
    choices: [],
    answer: 'よしののさとに　ふれるしらゆき',
  },
  {
    question: 'やまがはに　かぜのかけたる　しがらみは',
    choices: [],
    answer: 'ながれもあへぬ　もみぢなりけり',
  },
  {
    question: 'ひさかたの　ひかりのどけき　はるのひに',
    choices: [],
    answer: 'しづごころなく　はなのちるらむ',
  },
  {
    question: 'たれをかも　しるひとにせむ　たかさごの',
    choices: [],
    answer: 'まつもむかしの　ともならなくに',
  },
  {
    question: 'ひとはいさ　こころもしらず　ふるさとは',
    choices: [],
    answer: 'はなぞむかしの　かににほひける',
  },
  {
    question: 'なつのよは　まだよひながら　あけぬるを',
    choices: [],
    answer: 'くものいづこに　つきやどるらむ',
  },
  {
    question: 'しらつゆに　かぜのふきしく　あきののは',
    choices: [],
    answer: 'つらぬきとめぬ　たまぞちりける',
  },
  {
    question: 'わすらるる　みをばおもはず　ちかひてし',
    choices: [],
    answer: 'ひとのいのちの　をしくもあるかな',
  },
  {
    question: 'あさぢふの　をののしのはら　しのぶれど',
    choices: [],
    answer: 'あまりてなどか　ひとのこひしき',
  },
  {
    question: 'しのぶれど　いろにいでにけり　わがこひは',
    choices: [],
    answer: 'ものやおもふと　ひとのとふまで',
  },
  {
    question: 'こひすてふ　わがなはまだき　たちにけり',
    choices: [],
    answer: 'ひとしれずこそ　おもひそめしか',
  },
  {
    question: 'ちぎりきな　かたみにそでを　しぼりつつ',
    choices: [],
    answer: 'すゑのまつやま　なみこさじとは',
  },
  {
    question: 'あひみての　のちのこころに　くらぶれば',
    choices: [],
    answer: 'むかしはものを　おもはざりけり',
  },
  {
    question: 'あふことの　たえてしなくは　なかなかに',
    choices: [],
    answer: 'ひとをもみをも　うらみざらまし',
  },
  {
    question: 'あはれとも　いふべき人は　思ほえで',
    choices: [],
    answer: '身のいたづらに　なりぬべきかな',
  },
  {
    question: 'ゆらのとを　わたるふなびと　かぢをたえ',
    choices: [],
    answer: 'ゆくへもしらぬ　こひのみちかな',
  },
  {
    question: 'やへむぐら　しげれるやどの　さびしきに',
    choices: [],
    answer: 'ひとこそみえね　あきはきにけり',
  },
  {
    question: 'かぜをいたみ　いはうつなみの　おのれのみ',
    choices: [],
    answer: 'くだけてものを　おもふころかな',
  },
  {
    question: 'みかきもり　ゑじのたくひの　よるはもえ',
    choices: [],
    answer: 'ひるはきえつつ　ものをこそおもへ',
  },
  {
    question: 'きみがため　をしからざりし　いのちさへ',
    choices: [],
    answer: 'ながくもがなと　おもひけるかな',
  },
  {
    question: 'かくとだに　えやはいぶきの　さしもぐさ',
    choices: [],
    answer: 'さしもしらじな　もゆるおもひを',
  },
  {
    question: 'あけぬれば　くるるものとは　しりながら',
    choices: [],
    answer: 'なほうらめしき　あさぼらけかな',
  },
  {
    question: 'なげきつつ　ひとりぬるよの　あくるまは',
    choices: [],
    answer: 'いかにひさしき　ものとかはしる',
  },
  {
    question: 'わすれじの　ゆくすゑまでは　かたければ',
    choices: [],
    answer: 'けふをかぎりの　いのちともがな',
  },
  {
    question: 'たきのおとは　たえてひさしく　なりぬれど',
    choices: [],
    answer: 'なこそながれて　なほきこえけれ',
  },
  {
    question: 'あらざらむ　このよのほかの　おもひでに',
    choices: [],
    answer: 'いまひとたびの　あふこともがな',
  },
  {
    question: 'めぐりあひて　みしやそれとも　わかぬまに',
    choices: [],
    answer: 'くもがくれにし　よはのつきかな',
  },
  {
    question: 'ありまやま　ゐなのささはら　かぜふけば',
    choices: [],
    answer: 'いでそよひとを　わすれやはする',
  },
  {
    question: 'やすらはで　ねなましものを　さよふけて',
    choices: [],
    answer: 'かたぶくまでの　つきをみしかな',
  },
  {
    question: 'おほえやま　いくののみちの　とほければ',
    choices: [],
    answer: 'まだふみもみず　あまのはしだて',
  },
  {
    question: 'いにしへの　ならのみやこの　やへざくら',
    choices: [],
    answer: 'けふここのへに　にほひぬるかな',
  },
  {
    question: 'よをこめて　とりのそらねは　はかるとも',
    choices: [],
    answer: 'よにあふさかの　せきはゆるさじ',
  },
  {
    question: 'いまはただ　おもひたえなむ　とばかりを',
    choices: [],
    answer: 'ひとづてならで　いふよしもがな',
  },
  {
    question: 'あさぼらけ　うぢのかはぎり　たえだえに',
    choices: [],
    answer: 'あらはれわたる　せぜのあじろぎ',
  },
  {
    question: 'うらみわび　ほさぬそでだに　あるものを',
    choices: [],
    answer: 'こひにくちなむ　なこそをしけれ',
  },
  {
    question: 'もろともに　あはれとおもへ　やまざくら',
    choices: [],
    answer: 'はなよりほかに　しるひともなし',
  },
  {
    question: 'はるのよの　ゆめばかりなる　たまくらに',
    choices: [],
    answer: 'かひなくたたむ　なこそをしけれ',
  },
  {
    question: 'こころにも　あらでうきよに　ながらへば',
    choices: [],
    answer: 'こひしかるべき　よはのつきかな',
  },
  {
    question: 'あらしふく　みむろのやまの　もみぢばは',
    choices: [],
    answer: 'たつたのかはの　にしきなりけり',
  },
  {
    question: 'さびしさに　やどをたちいでて　ながむれば',
    choices: [],
    answer: 'いづこもおなじ　あきのゆふぐれ',
  },
  {
    question: 'ゆふされば　かどたのいなば　おとづれて',
    choices: [],
    answer: 'あしのまろやに　あきかぜぞふく',
  },
  {
    question: 'おとにきく　たかしのはまの　あだなみは',
    choices: [],
    answer: 'かけじやそでの　ぬれもこそすれ',
  },
  {
    question: 'たかさごの　をのへのさくら　さきにけり',
    choices: [],
    answer: 'とやまのかすみ　たたずもあらなむ',
  },
  {
    question: 'うかりける　ひとをはつせの　やまおろしよ',
    choices: [],
    answer: 'はげしかれとは　いのらぬものを',
  },
  {
    question: 'ちぎりおきし　させもがつゆを　いのちにて',
    choices: [],
    answer: 'あはれことしの　あきもいぬめり',
  },
  {
    question: 'わたのはら　こぎいでてみれば　ひさかたの',
    choices: [],
    answer: 'くもゐにまがふ　おきつしらなみ',
  },
  {
    question: 'せをはやみ　いはにせかるる　たきがはの',
    choices: [],
    answer: 'われてもすゑに　あはむとぞおもふ',
  },
  {
    question: 'あはぢしま　かよふちどりの　なくこゑに',
    choices: [],
    answer: 'いくよねざめぬ　すまのせきもり',
  },
  {
    question: 'あきかぜに　たなびくくもの　たえまより',
    choices: [],
    answer: 'もれいづるつきの　かげのさやけさ',
  },
  {
    question: 'ながからむ　こころもしらず　くろかみの',
    choices: [],
    answer: 'みだれてけさは　ものをこそおもへ',
  },
  {
    question: 'ほととぎす　なきつるかたを　ながむれば',
    choices: [],
    answer: 'ただありあけの　つきぞのこれる',
  },
  {
    question: 'おもひわび　さてもいのちは　あるものを',
    choices: [],
    answer: 'うきにたへぬは　なみだなりけり',
  },
  {
    question: 'よのなかよ　みちこそなけれ　おもひいる',
    choices: [],
    answer: 'やまのおくにも　しかぞなくなる',
  },
  {
    question: 'ながらへば　またこのごろや　しのばれむ',
    choices: [],
    answer: 'うしとみしよぞ　いまはこひしき',
  },
  {
    question: 'よもすがら　ものおもふころは　あけやらで',
    choices: [],
    answer: 'ねやのひまさへ　つれなかりけり',
  },
  {
    question: 'なげけとて　つきやはものを　おもはする',
    choices: [],
    answer: 'かこちがほなる　わがなみだかな',
  },
  {
    question: 'むらさめの　つゆもまだひぬ　まきのはに',
    choices: [],
    answer: 'きりたちのぼる　あきのゆふぐれ',
  },
  {
    question: 'なにはえの　あしのかりねの　ひとよゆゑ',
    choices: [],
    answer: 'みをつくしてや　こひわたるべき',
  },
  {
    question: 'たまのをよ　たえなばたえね　ながらへば',
    choices: [],
    answer: 'しのぶることの　よわりもぞする',
  },
  {
    question: 'みせばやな　をじまのあまの　そでだにも',
    choices: [],
    answer: 'ぬれにぞぬれし　いろはかはらず',
  },
  {
    question: 'きりぎりす　なくやしもよの　さむしろに',
    choices: [],
    answer: 'ころもかたしき　ひとりかもねむ',
  },
  {
    question: 'わがそでは　しほひにみえぬ　おきのいしの',
    choices: [],
    answer: 'ひとこそしらね　かわくまもなし',
  },
  {
    question: 'よのなかは　つねにもがもな　なぎさこぐ',
    choices: [],
    answer: 'あまのをぶねの　つなでかなしも',
  },
  {
    question: 'みよしのの　やまのあきかぜ　さよふけて',
    choices: [],
    answer: 'ふるさとさむく　ころもうつなり',
  },
  {
    question: 'おほけなく　うきよのたみに　おほふかな',
    choices: [],
    answer: 'わがたつそまに　すみぞめのそで',
  },
  {
    question: 'はなさそふ　あらしのにはの　ゆきならで',
    choices: [],
    answer: 'ふりゆくものは　わがみなりけり',
  },
  {
    question: 'こぬひとを　まつほのうらの　ゆふなぎに',
    choices: [],
    answer: 'やくやもしほの　みもこがれつつ',
  },
  {
    question: 'かぜそよぐ　ならのをがはの　ゆふぐれは',
    choices: [],
    answer: 'みそぎぞなつの　しるしなりける',
  },
  {
    question: 'ひともをし　ひともうらめし　あぢきなく',
    choices: [],
    answer: 'よをおもふゆゑに　ものおもふみは',
  },
  {
    question: 'ももしきや　ふるきのきばの　しのぶにも',
    choices: [],
    answer: 'なほあまりある　むかしなりけり',
  },
]
