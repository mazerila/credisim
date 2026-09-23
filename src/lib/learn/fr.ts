import type { Content } from './types';

export const fr: Content = {
  loan: {
    title: 'Qu’est-ce qu’un crédit ?',
    lead: 'La banque vous prête une somme aujourd’hui. Vous la remboursez chaque mois, en payant en plus le prix de ce service : les intérêts.',
    read: 2,
    blocks: [
      { p: 'Tout crédit tient en quatre chiffres. Si l’un change, les autres bougent.' },
      {
        terms: [
          { term: 'Capital', def: 'La somme empruntée, par exemple 200 000 €.' },
          { term: 'Taux', def: 'Le prix annuel de l’argent, par exemple 3,2 %. Il sert à calculer les intérêts.', link: 'monthly-payment' },
          { term: 'Durée', def: 'Le temps pour rembourser, par exemple 20 ans (240 mensualités).' },
          { term: 'Mensualité', def: 'Ce que vous payez chaque mois. Elle rembourse une partie du capital et paie les intérêts.', link: 'amortization' },
        ],
      },
      { h: 'Plus long : moins cher par mois, plus cher au total' },
      { p: 'Étaler le même prêt sur plus d’années baisse la mensualité, mais vous payez des intérêts plus longtemps. Le tableau ci-dessous prend un prêt de 200 000 € à 3,2 %.' },
      { example: 'durations' },
      { h: 'Ce qui s’ajoute' },
      { p: 'Les intérêts ne sont pas le seul coût. La plupart des prêts comportent aussi une **assurance emprunteur**, des **frais** et, pour un logement, une **garantie** et des **frais de notaire**. Le [TAEG](#learn/taeg) les regroupe en un seul taux pour comparer les offres.' },
      { note: 'En France, le taux fixe est la norme : le taux et la mensualité restent les mêmes jusqu’à la fin.' },
    ],
  },

  'monthly-payment': {
    title: 'Comment se calcule la mensualité',
    lead: 'À taux fixe, toutes les mensualités sont identiques. La banque choisit le montant unique qui rembourse le prêt pile à la dernière échéance.',
    read: 3,
    blocks: [
      { p: 'Chaque mois, la banque calcule d’abord les intérêts sur ce que vous devez encore : **capital restant dû × taux annuel ÷ 12**. Le reste de la mensualité rembourse le capital.' },
      { p: 'La mensualité constante qui ramène le capital à zéro à la dernière échéance est donnée par la formule classique :' },
      { note: 'mensualité = capital × r ÷ (1 − (1 + r)^−n), où r est le taux annuel divisé par 12 et n le nombre de mois.' },
      { p: 'Par exemple, 100 000 € à 3 % sur 20 ans donnent **554,60 € par mois**. Sur 240 mois vous payez 133 104 € : les 100 000 € empruntés plus environ 33 100 € d’intérêts.' },
      { h: 'Essayez' },
      { example: 'payment' },
      { h: 'Ce qui fait le plus bouger la mensualité' },
      {
        list: [
          '**Le capital :** doublez-le, la mensualité double.',
          '**La durée :** passer de 20 à 25 ans baisse la mensualité d’environ 14 %, mais ajoute environ 28 % d’intérêts.',
          '**Le taux :** chaque 0,1 point de plus coûte environ 5 € par mois pour 100 000 € sur 20 ans (environ 1 200 € sur la durée du prêt).',
        ],
      },
      { p: 'L’assurance s’ajoute en général à cette mensualité. Voir [l’assurance emprunteur](#learn/insurance).' },
    ],
  },

  amortization: {
    title: 'Intérêts et capital : le tableau d’amortissement',
    lead: 'Votre mensualité ne change pas, mais sa composition, si. Au début ce sont surtout des intérêts ; à la fin, surtout du capital.',
    read: 2,
    blocks: [
      { p: 'Les intérêts se calculent sur ce que vous devez encore. Au début vous devez beaucoup, donc une grande partie de la mensualité part en intérêts. Chaque mois le capital restant baisse un peu, les intérêts aussi, et une plus grande part de la même mensualité rembourse le capital.' },
      { example: 'amortization' },
      { p: 'Le **tableau d’amortissement** détaille chaque mois : l’échéance, sa part d’intérêts, sa part de capital, l’assurance et le capital restant dû. La banque doit vous le remettre avec l’offre.' },
      { h: 'Pourquoi c’est important' },
      {
        list: [
          'Après 10 ans d’un prêt sur 20 ans, vous avez remboursé **moins de la moitié** du capital.',
          'Un remboursement anticipé fait économiser le plus d’intérêts dans les premières années.',
          'Si vous vendez, la banque récupère le **capital restant dû**, pas ce que vous avez déjà payé.',
        ],
      },
    ],
  },

  taeg: {
    title: 'Ce que contient le TAEG',
    lead: 'Le TAEG (taux annuel effectif global) est le taux annuel tout compris. C’est le chiffre à comparer entre les offres.',
    read: 3,
    blocks: [
      { p: 'Le **taux nominal** (taux débiteur) ne calcule que les intérêts. Le **TAEG** compte aussi tous les frais obligatoires pour obtenir le prêt :' },
      {
        list: [
          'les intérêts',
          'l’assurance emprunteur, quand la banque l’exige',
          'les frais de dossier et de courtage',
          'la garantie (caution, hypothèque ou privilège)',
          'les éventuels frais de compte ou de package imposés',
        ],
      },
      { p: 'Les frais de notaire de l’achat ne sont **pas** dans le TAEG : ils font partie du prix du logement, pas du crédit.' },
      { h: 'Comment il se calcule' },
      { p: 'Le TAEG est le taux pour lequel tout ce que vous remboursez, mois après mois, équivaut à l’argent réellement reçu (le prêt moins les frais payés au départ). Depuis 2016, la France applique la méthode **actuarielle** européenne : c’est pourquoi un taux nominal de 3,20 % s’affiche déjà 3,25 % avant tout frais.' },
      { example: 'taeg' },
      { note: 'La loi impose que le TAEG reste sous le [taux d’usure](#learn/usury) de ce type de prêt. Au-delà, l’offre ne peut pas être faite.' },
      { p: 'Le **TAEA** est la part du TAEG qui vient de l’assurance seule. Il sert à comparer les offres d’assurance.' },
    ],
  },

  insurance: {
    title: 'L’assurance emprunteur',
    lead: 'Elle rembourse le prêt si un emprunteur décède ou ne peut plus travailler. Exigée pour un crédit immobilier, elle peut coûter presque autant que les intérêts.',
    read: 3,
    blocks: [
      { h: 'Deux façons de la calculer' },
      {
        list: [
          '**Sur le capital initial :** la cotisation est la même chaque mois, du premier au dernier. C’est le cas des contrats groupe des banques.',
          '**Sur le capital restant dû :** la cotisation suit le capital et baisse chaque mois. C’est le cas des contrats individuels (délégation).',
        ],
      },
      { p: 'À taux annuel égal, la version sur capital restant dû coûte bien moins cher sur la durée du prêt :' },
      { example: 'insurance' },
      { h: 'La quotité' },
      { p: 'La quotité est la part du prêt assurée pour chaque emprunteur. Seul, elle doit être de 100 %. Un couple peut choisir 50 % + 50 %, ou 100 % chacun (200 % au total) : le survivant est alors totalement protégé, mais l’assurance coûte deux fois plus.' },
      { h: 'Vous pouvez changer d’assureur à tout moment' },
      {
        list: [
          'Depuis la **loi Lemoine** (2022), vous pouvez changer à tout moment, sans frais, si le nouveau contrat offre des garanties équivalentes.',
          'Pas de questionnaire de santé si votre part des prêts est **inférieure ou égale à 200 000 €** et qu’ils se terminent **avant vos 60 ans**.',
          'Passer du contrat groupe à une délégation fait souvent économiser plusieurs milliers d’euros.',
        ],
      },
    ],
  },

  guarantee: {
    title: 'La garantie du prêt',
    lead: 'Elle protège la banque si vous ne payez plus. Vous la payez une fois, au départ, et elle compte dans le TAEG.',
    read: 2,
    blocks: [
      {
        table: {
          head: ['Type', 'Fonctionnement', 'Coût habituel'],
          rows: [
            ['Caution (ex. Crédit Logement)', 'Un organisme se porte garant du prêt. Une partie de ce que vous versez alimente un fonds mutuel et vous est en partie restituée à la fin.', 'environ 0,75 % du prêt + 300 €, en partie restitué'],
            ['Hypothèque', 'Inscrite par le notaire sur le bien. La banque peut le faire vendre en cas d’impayés.', 'environ 1 à 2 % du prêt, plus des frais de mainlevée en cas de vente anticipée'],
            ['Privilège de prêteur de deniers (PPD)', 'Comme une hypothèque, mais réservé à l’achat d’un logement existant, et moins cher car exonéré de taxe de publicité foncière.', 'environ 1 % du prêt'],
          ],
        },
      },
      { p: 'La plupart des prêts immobiliers en France utilisent une caution. L’hypothèque est fréquente pour les gros montants ou quand l’organisme de caution refuse le dossier.' },
      { note: 'Dans Credisim, la garantie est estimée selon son type. Si votre offre donne le montant exact, décochez « Estimer automatiquement » et saisissez-le.' },
    ],
  },

  notary: {
    title: 'Les frais de notaire',
    lead: 'Il s’agit surtout de taxes, que le notaire collecte pour l’État et le département lors de l’achat.',
    read: 3,
    blocks: [
      { p: 'Ils se composent de trois parties :' },
      {
        list: [
          '**Les droits de mutation :** la plus grosse part. Pour un logement ancien, environ 6,3 % du prix dans la plupart des départements ; 0,7 % dans le neuf.',
          '**Les émoluments du notaire :** fixés par un barème réglementé, environ 1 % du prix, plus la TVA.',
          '**Les débours et la contribution :** frais avancés par le notaire pour vous, plus une contribution de sécurité immobilière de 0,1 %.',
        ],
      },
      { example: 'notary' },
      { h: 'Ancien ou neuf' },
      { p: 'Comptez environ **7 à 8 %** du prix dans l’ancien et **2 à 3 %** dans le neuf.' },
      { h: 'Primo-accédants' },
      { p: 'La plupart des départements ont relevé leur taxe de 4,5 % à 5 % entre avril 2025 et mars 2028. **Les primo-accédants qui achètent leur résidence principale échappent** à cette hausse, soit une économie d’environ 0,5 % du prix.' },
      { note: 'Les frais de notaire font partie du coût du projet, pas du coût du crédit : ils ne sont pas dans le TAEG. Les banques attendent en général que l’apport les couvre.' },
    ],
  },

  usury: {
    title: 'Le taux d’usure : le maximum légal',
    lead: 'Le taux d’usure est le TAEG le plus élevé qu’un prêteur a le droit de pratiquer. Il protège les emprunteurs contre les taux abusifs.',
    read: 2,
    blocks: [
      { p: 'La Banque de France le fixe chaque trimestre pour chaque catégorie de prêt, à partir des taux moyens du trimestre précédent, majorés d’un tiers.' },
      { example: 'usury' },
      { p: 'Le contrôle porte sur le **TAEG**, pas sur le taux nominal. Un taux nominal bas peut dépasser la limite si l’assurance et les frais sont chers, ce qui touche surtout les emprunteurs âgés ou les petits prêts.' },
      { note: 'Credisim compare automatiquement votre TAEG au bon plafond et indique le trimestre des taux utilisés.' },
    ],
  },

  'debt-ratio': {
    title: 'La règle des 35 % et la limite de 25 ans',
    lead: 'Pour les crédits immobiliers, les banques françaises doivent respecter deux règles du HCSF, le Haut Conseil de stabilité financière.',
    read: 2,
    blocks: [
      {
        list: [
          '**Taux d’endettement ≤ 35 % :** toutes vos mensualités de crédit, assurance comprise, doivent rester sous 35 % de vos revenus nets mensuels.',
          '**Durée ≤ 25 ans :** 27 ans dans le neuf quand le remboursement commence après les travaux (différé).',
        ],
      },
      { example: 'debt' },
      { p: 'Les banques peuvent dépasser ces limites pour 20 % au plus de leurs nouveaux prêts chaque trimestre, surtout pour les résidences principales et les primo-accédants. Un dossier au-delà de 35 % n’est donc pas impossible, mais il doit être solide : reste à vivre élevé, épargne, emploi stable.' },
      { h: 'Comment baisser votre taux' },
      { list: ['Emprunter plus longtemps (jusqu’à 25 ans).', 'Mettre un apport plus important.', 'Solder les petits crédits avant la demande.', 'Choisir une assurance moins chère.'] },
    ],
  },

  'consumer-credit': {
    title: 'Le crédit à la consommation et vos droits',
    lead: 'Les prêts personnels, auto et travaux relèvent du droit du crédit à la consommation, avec ses propres protections.',
    read: 2,
    blocks: [
      {
        list: [
          '**14 jours pour changer d’avis** après la signature d’un crédit à la consommation, sans justification.',
          '**Taux d’usure par montant :** jusqu’à 3 000 €, de 3 000 à 6 000 € et au-delà de 6 000 €. Les petits prêts peuvent légalement coûter plus cher.',
          '**Les prêts travaux de plus de 75 000 €** suivent les règles du crédit immobilier.',
          'Le prêteur doit vous remettre une fiche d’information standardisée (FIPEN, « SECCI ») et vérifier votre solvabilité.',
        ],
      },
      { h: 'Crédit immobilier' },
      { list: ['L’offre reste valable au moins **30 jours**.', 'Vous devez attendre **10 jours** après l’avoir reçue avant de l’accepter (signature possible à partir du 11e jour).', 'Le compromis de vente contient en général une condition suspensive : sans prêt, vous pouvez renoncer à l’achat.'] },
      { note: 'À partir du 20 novembre 2026 (directive européenne CCD2), les mini-crédits de moins de 200 € et le paiement fractionné sont aussi encadrés, avec un TAEG affiché.' },
    ],
  },

  ptz: {
    title: 'Le PTZ : prêt à taux zéro',
    lead: 'Le prêt à taux zéro aide les primo-accédants à financer leur résidence principale. Il ne coûte ni intérêts ni frais.',
    read: 3,
    blocks: [
      {
        list: [
          'Pour les personnes **qui n’ont pas été propriétaires de leur résidence principale depuis 2 ans**.',
          'Sous conditions de revenus : les plafonds dépendent de la zone (A bis, A, B1, B2, C) et de la taille du foyer.',
          'Disponible jusqu’au **31 décembre 2027**.',
          'Il ne finance qu’une partie de l’achat (10 à 50 % selon les revenus et le type de logement) : un prêt principal reste nécessaire.',
        ],
      },
      { h: 'Le remboursement dépend de votre tranche de revenus' },
      { example: 'ptz' },
      { p: 'Pendant le différé, vous ne remboursez rien sur le PTZ, ce qui allège la mensualité totale au début. Les banques « lissent » souvent le prêt principal pour que le total reste constant.' },
      { note: 'Credisim ajoutera le PTZ au simulateur dans une phase suivante. En attendant, vous pouvez l’estimer avec le simulateur officiel de l’ANIL.' },
    ],
  },

  calculator: {
    title: 'Comment fonctionne ce simulateur',
    lead: 'Ce que Credisim calcule, les hypothèses retenues et l’origine de ses données.',
    read: 3,
    blocks: [
      { h: 'Ce qu’il calcule' },
      {
        list: [
          'La mensualité d’un prêt **à taux fixe** et à échéances constantes, et le tableau d’amortissement complet, arrondi au centime comme un relevé bancaire.',
          'L’assurance sur le capital initial ou sur le capital restant dû.',
          'Le **TAEG** selon la méthode actuarielle européenne, et sa répartition entre intérêts, assurance et frais.',
          'Le montant à emprunter : prix + frais de notaire + travaux + frais + garantie − apport.',
          'Les contrôles légaux : taux d’usure, endettement à 35 %, durée de 25 ans.',
          'Votre capacité d’emprunt à 35 % de vos revenus.',
        ],
      },
      { h: 'Hypothèses et limites' },
      {
        list: [
          'Les frais de notaire suivent le barème réglementé et les droits de mutation 2026, avec des débours forfaitaires d’environ 1 200 €. Le chiffre de votre notaire peut légèrement différer.',
          'La garantie est estimée (caution environ 0,75 % + 300 € ; hypothèque environ 1,5 % ; PPD environ 1 %). La restitution partielle en fin de prêt avec caution n’est pas déduite.',
          'Les frais sont financés dans un crédit immobilier et payés à part pour un crédit à la consommation.',
          'La capacité d’emprunt compte l’assurance à son niveau du premier mois, ce qui reste prudent.',
          'Pas encore inclus : PTZ et prêts aidés, différé, taux variables, remboursement anticipé. Ils arrivent dans les prochaines phases.',
        ],
      },
      { h: 'Données et sources' },
      {
        list: [
          'Taux d’usure : Banque de France, mis à jour chaque trimestre. Le trimestre utilisé est indiqué sous le TAEG.',
          'Règles d’octroi : HCSF, confirmées en mars 2026.',
          'Barème des notaires et droits de mutation : tarifs réglementés 2026.',
        ],
      },
      { h: 'Confidentialité' },
      { p: 'Tout est calculé dans votre navigateur. Rien de ce que vous saisissez n’est envoyé à un serveur. Un lien de partage contient la simulation dans le lien lui-même.' },
      { note: 'Credisim donne des estimations indicatives. Seule l’offre du prêteur engage.' },
    ],
  },

  glossary: {
    title: 'Lexique',
    lead: 'Les mots d’une offre de prêt, expliqués simplement.',
    read: 4,
    blocks: [
      {
        terms: [
          { term: 'Amortissement', def: 'Le remboursement du capital, petit à petit, à chaque échéance.', link: 'amortization' },
          { term: 'Apport', def: 'Votre argent personnel investi dans l’achat. Il couvre en général au moins les frais de notaire.' },
          { term: 'Capacité d’emprunt', def: 'Le prêt maximum possible en gardant vos mensualités à 35 % de vos revenus.', link: 'debt-ratio' },
          { term: 'Capital restant dû', def: 'Le capital que vous devez encore à une date donnée.', link: 'amortization' },
          { term: 'Caution', def: 'Garantie apportée par un organisme spécialisé, en partie restituée à la fin.', link: 'guarantee' },
          { term: 'Courtier', def: 'Intermédiaire qui compare les banques pour vous, en général contre des honoraires.' },
          { term: 'Coût du crédit', def: 'Tout ce que vous payez en plus du capital : intérêts, assurance, frais, garantie.', link: 'taeg' },
          { term: 'Délai de réflexion', def: '10 jours d’attente obligatoire avant d’accepter une offre de crédit immobilier.', link: 'consumer-credit' },
          { term: 'Délégation d’assurance', def: 'Choisir un autre assureur que le contrat groupe de la banque.', link: 'insurance' },
          { term: 'Différé', def: 'Période au début du prêt où vous ne remboursez pas le capital (partiel) ou rien du tout (total).' },
          { term: 'Frais de notaire', def: 'Surtout des taxes payées lors de l’achat d’un bien.', link: 'notary' },
          { term: 'Garantie', def: 'Protection de la banque si vous ne remboursez plus.', link: 'guarantee' },
          { term: 'IRA (indemnités de remboursement anticipé)', def: 'Pénalité en cas de remboursement anticipé d’un crédit immobilier, plafonnée à 6 mois d’intérêts ou 3 % du capital restant dû (le plus faible des deux).' },
          { term: 'Mensualité', def: 'La somme payée chaque mois.', link: 'monthly-payment' },
          { term: 'Primo-accédant', def: 'Personne qui n’a pas été propriétaire de sa résidence principale récemment. Compte pour le PTZ et les frais de notaire.', link: 'ptz' },
          { term: 'PTZ (prêt à taux zéro)', def: 'Prêt sans intérêts aidé par l’État pour les primo-accédants.', link: 'ptz' },
          { term: 'Quotité', def: 'Part du prêt assurée pour chaque emprunteur.', link: 'insurance' },
          { term: 'Tableau d’amortissement', def: 'Détail mois par mois des échéances, intérêts, capital et capital restant dû.', link: 'amortization' },
          { term: 'TAEA', def: 'La part du TAEG qui vient de l’assurance.', link: 'taeg' },
          { term: 'TAEG', def: 'Taux annuel tout compris : intérêts, assurance, frais et garantie.', link: 'taeg' },
          { term: 'Taux d’endettement', def: 'Mensualités de crédit divisées par les revenus nets mensuels.', link: 'debt-ratio' },
          { term: 'Taux d’usure', def: 'Le TAEG maximum légal, fixé chaque trimestre.', link: 'usury' },
          { term: 'Taux nominal (taux débiteur)', def: 'Le taux qui sert uniquement à calculer les intérêts.', link: 'monthly-payment' },
        ],
      },
    ],
  },
};
