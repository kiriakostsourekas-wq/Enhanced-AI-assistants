import type {
  DemoLandingPage,
  DemoLandingPageMediaItem,
  DiscoveredProspect,
} from "@/lib/antigravity/schemas";

type DemoLandingPageDoctor = DemoLandingPage["doctorCards"][number];
type DemoLandingPageService = DemoLandingPage["services"][number];
type DemoLandingPageTestimonial = DemoLandingPage["testimonials"][number];

type EditorialHeroCopy = {
  eyebrow: string;
  headline: string;
  subheadline: string;
};

type EditorialHeroStat = {
  label: string;
  value: string;
};

export type EditorialClinicProfile = {
  title?: string;
  hero: EditorialHeroCopy;
  heroBadges?: string[];
  heroStats?: EditorialHeroStat[];
  heroImageUrl?: string;
  heroImageAlt?: string;
  mediaGallery?: DemoLandingPageMediaItem[];
  trustItems?: string[];
  doctorCards?: DemoLandingPageDoctor[];
  services?: DemoLandingPageService[];
  testimonials?: DemoLandingPageTestimonial[];
  sections?: Array<{ heading: string; body: string }>;
};

function matchesDomain(prospect: DiscoveredProspect, domain: string) {
  const haystack = `${prospect.websiteDomain ?? ""} ${prospect.websiteUrl ?? ""}`.toLowerCase();
  return haystack.includes(domain.toLowerCase());
}

export function resolveEditorialClinicProfile(prospect: DiscoveredProspect): EditorialClinicProfile | undefined {
  if (matchesDomain(prospect, "athensdentalspecialists.gr")) {
    return {
      title: "Athens Dental Clinic | Premium concept redesign",
      hero: {
        eyebrow: "Greek-first dental redesign",
        headline: "Γενική, αισθητική και laser οδοντιατρική στο Σύνταγμα με καθαρότερη διαδρομή προς ραντεβού.",
        subheadline:
          "Το demo μετατρέπει το generic homepage into a clearer clinic proposition: για κάθε ηλικία, με σύγχρονο χώρο, πιο σαφή treatment hierarchy και δυνατότερο Athens location cue από το πρώτο scroll.",
      },
      heroBadges: ["Σύνταγμα, Αθήνα", "Για κάθε ηλικία", "General • Aesthetic • Laser", "Concept demo"],
      heroStats: [
        { label: "Περιοχή", value: "Σύνταγμα" },
        { label: "Ραντεβού", value: "Κατόπιν ραντεβού" },
        { label: "Τηλέφωνο", value: "+30 210 32 32 553" },
      ],
      heroImageUrl: "https://www.athensdentalspecialists.gr/images/2025/03/06/2024-03-07.jpg",
      heroImageAlt: "Χώρος οδοντιατρείου στο Σύνταγμα",
      mediaGallery: [
        {
          url: "https://www.athensdentalspecialists.gr/images/2025/03/06/2024-03-07.jpg",
          caption: "Χώρος οδοντιατρείου στο Σύνταγμα",
          sourceLabel: "Homepage",
          emphasis: "clinic",
        },
        {
          url: "https://www.athensdentalspecialists.gr/images/2025/03/06/2024-03-07-1.jpg",
          caption: "Σύγχρονο και φιλικό περιβάλλον θεραπείας",
          sourceLabel: "About",
          emphasis: "clinic",
        },
        {
          url: "https://www.athensdentalspecialists.gr/images/2025/03/06/2024-03-07-2.jpg",
          caption: "Καθαρός χώρος με έμφαση στην ήρεμη εμπειρία ασθενή",
          sourceLabel: "About",
          emphasis: "clinic",
        },
        {
          url: "https://www.athensdentalspecialists.gr/images/2025/03/14/invisiblesiderakia.jpg",
          caption: "Ορθοδοντική με διαφανείς νάρθηκες",
          sourceLabel: "Contact",
          emphasis: "service",
        },
      ],
      trustItems: [
        "Σύνταγμα, Αθήνα",
        "Πλήρης οδοντιατρική κάλυψη για κάθε ηλικία",
        "Σύγχρονος εξοπλισμός και φιλικό περιβάλλον",
        "Εξατομικευμένα σχέδια θεραπείας",
        "Διαθεσιμότητα για έκτακτα περιστατικά",
        "Δίκτυο συνεργατών σε σύγχρονες οδοντιατρικές ειδικότητες",
      ],
      services: [
        {
          title: "Καθαρισμός Δοντιών",
          eyebrow: "Core treatment",
          detail: "Μία από τις πιο άμεσα κατανοητές υπηρεσίες για νέο επισκέπτη, και σωστά ανεβασμένη νωρίς στη δομή του demo.",
          imageUrl: "https://www.athensdentalspecialists.gr/images/2025/03/06/2024-03-07-1.jpg",
          imageAlt: "Καθαρός χώρος οδοντιατρείου",
        },
        {
          title: "Σφράγισμα",
          eyebrow: "General dentistry",
          detail: "Παρουσιάζεται σε πιο καθαρό patient-facing block ώστε η βασική οδοντιατρική φροντίδα να μην χάνεται μέσα στο navigation.",
          imageUrl: "https://www.athensdentalspecialists.gr/images/2025/03/06/2024-03-07-2.jpg",
          imageAlt: "Χώρος οδοντιατρικής θεραπείας",
        },
        {
          title: "Απονεύρωση",
          eyebrow: "Restorative care",
          detail: "Η ενότητα γίνεται πιο σίγουρη και χρηστική όταν οι συχνές θεραπείες εμφανίζονται σε πρώτο επίπεδο.",
          imageUrl: "https://www.athensdentalspecialists.gr/images/2025/03/06/2024-03-07-4.jpg",
          imageAlt: "Οδοντιατρικός χώρος",
        },
        {
          title: "Λεύκανση Δοντιών",
          eyebrow: "Aesthetic dentistry",
          detail: "Αισθητική υπηρεσία που αξίζει πιο premium παρουσίαση αντί για buried service label.",
          imageUrl: "https://www.athensdentalspecialists.gr/images/2025/03/10/gallery7.jpg",
          imageAlt: "Αισθητική οδοντιατρική",
        },
        {
          title: "Οδοντικά Εμφυτεύματα",
          eyebrow: "Advanced treatment",
          detail: "Μπαίνει σε ξεχωριστό treatment card ώστε η κλινική να δείχνει εύρος υπηρεσιών χωρίς να γίνεται χαοτική.",
          imageUrl: "https://www.athensdentalspecialists.gr/images/2025/03/10/gallery4.jpg",
          imageAlt: "Οδοντιατρική αποκατάσταση",
        },
        {
          title: "Laser Οδοντιατρική",
          eyebrow: "Differentiator",
          detail: "Το demo τη φέρνει μπροστά ως clear differentiator, όχι ως ακόμα ένα buried item στη λίστα υπηρεσιών.",
          imageUrl: "https://www.athensdentalspecialists.gr/images/2025/03/10/gallery3.jpg",
          imageAlt: "Laser οδοντιατρική",
        },
        {
          title: "Ορθοδοντική με Διαφανείς Νάρθηκες",
          eyebrow: "Modern orthodontics",
          detail: "Συνδέει αισθητική, καθημερινότητα και πιο σύγχρονο treatment framing για mobile-first browsing.",
          imageUrl: "https://www.athensdentalspecialists.gr/images/2025/03/14/invisiblesiderakia.jpg",
          imageAlt: "Διαφανείς νάρθηκες",
        },
        {
          title: "Θήκες / Γέφυρες",
          eyebrow: "Prosthetic dentistry",
          detail: "Δίνει πιο ολοκληρωμένη εικόνα θεραπευτικού εύρους πριν ο επισκέπτης πάει στο contact block.",
          imageUrl: "https://www.athensdentalspecialists.gr/images/2025/03/06/2024-03-07.jpg",
          imageAlt: "Χώρος οδοντιατρείου",
        },
      ],
      testimonials: [
        {
          quote: "Εξαιρετική ιατρός, καθαρός χώρος και πολύ επαγγελματική εμπειρία.",
          source: "Google review",
        },
        {
          quote: "The doctor handled our cases with honesty and the staff made us feel welcome. We would highly recommend it.",
          source: "Google review",
        },
        {
          quote: "Πολύ όμορφος χώρος και σωστή επαγγελματίας με πολύ καλή δουλειά.",
          source: "Google review",
        },
      ],
      sections: [
        {
          heading: "Η προσφορά γίνεται σαφής στα πρώτα 5 δευτερόλεπτα",
          body: "Το νέο hero δηλώνει αμέσως general, aesthetic και laser dentistry στο Σύνταγμα, αντί να ζητά από τον επισκέπτη να αποκωδικοποιήσει μόνος του το menu και τις scattered υπηρεσίες.",
        },
        {
          heading: "Το clinic story χτίζει εμπιστοσύνη χωρίς γενικόλογη γλώσσα",
          body: "Το demo αναδεικνύει σύγχρονο χώρο, εξατομικευμένη φροντίδα και κάλυψη για κάθε ηλικία με πιο καθαρή ιεραρχία και λιγότερη template αίσθηση.",
        },
        {
          heading: "Το contact path δείχνει κεντρική Αθήνα και εύκολη πρόσβαση",
          body: "Η τοποθεσία στο Σύνταγμα και η booking-first λογική εμφανίζονται νωρίτερα ώστε η σελίδα να μοιάζει χρήσιμη, όχι απλώς όμορφη.",
        },
      ],
    };
  }

  if (matchesDomain(prospect, "retinaeyeclinic.gr")) {
    return {
      title: "Retina Eye Clinic | Specialist concept redesign",
      hero: {
        eyebrow: "Specialist ophthalmology redesign",
        headline: "Χειρουργός οφθαλμίατρος στην Αθήνα με καθαρότερη τοπική αξιοπιστία για καταρράκτη και αμφιβληστροειδή.",
        subheadline:
          "Το demo φέρνει τον Δρ. Γεώργιο Τριχώνα, την εξειδίκευση σε καταρράκτη, ωχρά κηλίδα και αμφιβληστροειδή, καθώς και το Αμπελόκηποι location proof πιο μπροστά από το πρώτο scroll.",
      },
      heroBadges: ["Αμπελόκηποι, Αθήνα", "MD, ABO", "Retina & Cataract", "Concept demo"],
      heroStats: [
        { label: "Περιοχή", value: "Αμπελόκηποι" },
        { label: "Τηλέφωνο", value: "+30 211 118 6471" },
        { label: "Εστίαση", value: "Καταρράκτης • Αμφιβληστροειδής" },
      ],
      heroImageUrl: "https://retinaeyeclinic.gr/wp-content/uploads/2019/11/trichonas-1-252x300.jpg",
      heroImageAlt: "Δρ. Γεώργιος Τριχώνας",
      mediaGallery: [
        {
          url: "https://retinaeyeclinic.gr/wp-content/uploads/2019/11/trichonas-1-252x300.jpg",
          alt: "Χειρουργός Οφθαλμίατρος Δρ. Γεώργιος Τριχώνας",
          caption: "Δρ. Γεώργιος Τριχώνας",
          sourceLabel: "About",
          emphasis: "portrait",
        },
        {
          url: "https://retinaeyeclinic.gr/wp-content/uploads/2019/11/trichonas-1.jpg",
          caption: "Ιατρείο οφθαλμολογίας με specialist-first παρουσίαση",
          sourceLabel: "Homepage",
          emphasis: "clinic",
        },
        {
          url: "https://retinaeyeclinic.gr/wp-content/uploads/elementor/thumbs/harvard-logo-pu183asp9wcn1pf7x9glzzdwydcw0kprjcnojrip70.png",
          caption: "Harvard Medical School",
          sourceLabel: "About",
          emphasis: "logo",
        },
        {
          url: "https://retinaeyeclinic.gr/wp-content/uploads/elementor/thumbs/pittsburgh-1-pu183ek218hsc59rbb349yfrbwucvd4ovv9mgvd4io.png",
          caption: "University of Pittsburgh - UPMC",
          sourceLabel: "About",
          emphasis: "logo",
        },
      ],
      trustItems: [
        "Θεοφάνους 12, Αμπελόκηποι, Αθήνα",
        "MD, ABO",
        "American Board of Ophthalmology",
        "Harvard Medical School",
        "University of Pittsburgh - UPMC",
        "Case Western Reserve University",
      ],
      doctorCards: [
        {
          name: "Δρ. Γεώργιος Τριχώνας",
          role: "Χειρουργός Οφθαλμίατρος",
          bio: "Εξειδικεύεται στον καταρράκτη, την ωχρά κηλίδα και την παθολογία του αμφιβληστροειδούς, με ιατρείο στους Αμπελόκηπους.",
          facts: [
            "MD, ABO",
            "Harvard Medical School",
            "University of Pittsburgh - UPMC",
            "Case Western Reserve University",
            "American Board of Ophthalmology",
          ],
          imageUrl: "https://retinaeyeclinic.gr/wp-content/uploads/2019/11/trichonas-1-252x300.jpg",
          imageAlt: "Δρ. Γεώργιος Τριχώνας",
        },
      ],
      services: [
        {
          title: "Χειρουργείο Καταρράκτη",
          eyebrow: "Core specialty",
          detail: "Μπαίνει σε featured θέση για να καταλαβαίνει αμέσως ο ασθενής μία από τις βασικές specialist κατευθύνσεις του ιατρείου.",
          imageUrl: "https://retinaeyeclinic.gr/wp-content/uploads/2020/10/katarraktis.jpg",
          imageAlt: "Χειρουργείο καταρράκτη",
        },
        {
          title: "ARGON LASER ΦΩΤΟΠΗΞΙΑ",
          eyebrow: "Retina treatment",
          detail: "Η σελίδα το παρουσιάζει ως σαφή therapeutic capability και όχι ως buried equipment line.",
          imageUrl:
            "https://retinaeyeclinic.gr/wp-content/uploads/2020/10/%CE%9A%CE%95%CE%9D%CE%A4%CE%A1%CE%99%CE%9A%CE%97-%CE%9F%CE%A1%CE%A9%CE%94%CE%97%CE%A3-%CE%A7%CE%9F%CE%A1%CE%99%CE%9F%CE%91%CE%9C%CE%A6%CE%99%CE%92%CE%9B%CE%97%CE%A3%CE%A4%CE%A1%CE%9F%CE%95%CE%99%CE%94%CE%9F%CE%A0%CE%91%CE%98%CE%95%CE%99%CE%91.jpg",
          imageAlt: "Retina treatment",
        },
        {
          title: "Ενδοβολβική Ένεση",
          eyebrow: "Therapeutic care",
          detail: "Το demo οργανώνει τη therapeutic ενότητα σε πιο καθαρά patient-facing cards με λιγότερο clutter.",
          imageUrl:
            "https://retinaeyeclinic.gr/wp-content/uploads/2020/10/%CE%94%CE%99%CE%91%CE%92%CE%97%CE%A4%CE%99%CE%9A%CE%97-%CE%91%CE%9C%CE%A6%CE%99%CE%92%CE%9B%CE%97%CE%A3%CE%A4%CE%A1%CE%9F%CE%95%CE%99%CE%94%CE%9F%CE%A0%CE%91%CE%98%CE%95%CE%99%CE%91.jpg",
          imageAlt: "Ενδοβολβική ένεση",
        },
        {
          title: "Υαλοειδεκτομή",
          eyebrow: "Surgical retina care",
          detail: "Κάνει πιο ορατή την advanced surgical δυνατότητα του ιατρείου σε κοινό που θέλει specialist assurance.",
          imageUrl:
            "https://retinaeyeclinic.gr/wp-content/uploads/2020/10/%CE%91%CE%A0%CE%9F%CE%9A%CE%9F%CE%9B%CE%9B%CE%97%CE%A3%CE%97-%CE%91%CE%9C%CE%A6%CE%99%CE%92%CE%9B%CE%97%CE%A3%CE%A4%CE%A1%CE%9F%CE%95%CE%99%CE%94%CE%9F%CE%A5%CE%A3.jpg",
          imageAlt: "Υαλοειδεκτομή",
        },
        {
          title: "Nd: YAG laser",
          eyebrow: "Laser treatment",
          detail: "Παρουσιάζεται ως καθαρό treatment option με specialist framing και όχι σαν τυχαία τεχνική αναφορά.",
          imageUrl:
            "https://retinaeyeclinic.gr/wp-content/uploads/2020/10/%CE%95%CF%80%CE%B9%CE%B1%CE%BC%CF%86%CE%B9%CE%B2%CE%BB%CE%B7%CF%83%CF%84%CF%81%CE%BF%CE%B5%CE%B9%CE%B4%CE%B9%CE%BA%CE%AE-%CE%BC%CE%B5%CE%BC%CE%B2%CF%81%CE%AC%CE%BD%CE%B7.jpg",
          imageAlt: "Nd:YAG laser",
        },
        {
          title: "Βυθοσκόπηση",
          eyebrow: "Diagnostic care",
          detail: "Το diagnostic block αποκτά πιο καθαρή ιεραρχία για ασθενείς που ψάχνουν εξέταση, όχι μόνο χειρουργείο.",
          imageUrl:
            "https://retinaeyeclinic.gr/wp-content/uploads/elementor/thumbs/badge_final_new-pu1862fkf94qmuvxqfutg2x3o40snx3ifudrjetm9s.png",
          imageAlt: "Diagnostic care",
        },
        {
          title: "Φωτογράφιση βυθού",
          eyebrow: "Diagnostic care",
          detail: "Συμπληρώνει την specialist αφήγηση με πιο χρήσιμη και scan-friendly diagnostic presentation.",
          imageUrl:
            "https://retinaeyeclinic.gr/wp-content/uploads/elementor/thumbs/badge_final_new-pu1862fkf94qmuvxqfutg2x3o40snx3ifudrjetm9s.png",
          imageAlt: "Φωτογράφιση βυθού",
        },
        {
          title: "SD-OCT: HEIDELBERG-SPECTRALIS",
          eyebrow: "Advanced diagnostics",
          detail: "Δείχνει τεχνολογικό βάθος με πιο premium specialist framing αντί για ακατέργαστη λίστα εξοπλισμού.",
          imageUrl:
            "https://retinaeyeclinic.gr/wp-content/uploads/elementor/thumbs/abo_logo-pu183gfqewkczd710bwdexyoiol3arc5k4klffac68.jpg",
          imageAlt: "Advanced diagnostics",
        },
      ],
      testimonials: [
        {
          quote: "Εξαιρετικός ιατρός, καταρτισμένος και πολύ ανθρώπινος. Τον συνιστώ ανεπιφύλακτα.",
          source: "Θ. Κ.",
        },
        {
          quote: "Από την πρώτη μου επίσκεψη, έμεινα πολύ ικανοποιημένη. Ο Δρ. Τριχώνας έχει ευγενικούς τρόπους, άριστη δεοντολογία και ιατρικές γνώσεις.",
          source: "Ε. Σ.",
        },
        {
          quote: "Αφιέρωσε πολύ χρόνο στην περίπτωσή μου και απάντησε σε όλες τις ερωτήσεις με σαφήνεια. Άριστος εξοπλισμός και χώρος ιατρείου.",
          source: "Σ. Σ.",
        },
      ],
      sections: [
        {
          heading: "Το specialist message είναι σαφές πριν από το πρώτο scroll",
          body: "Το νέο hero δηλώνει αμέσως καταρράκτη, αμφιβληστροειδή και local Athens presence, ώστε ο επισκέπτης να μη χρειάζεται να ξεδιαλύνει μόνος του ένα μακρύ mixed menu.",
        },
        {
          heading: "Η τοπική αξιοπιστία των Αμπελοκήπων φαίνεται νωρίς",
          body: "Διεύθυνση, neighborhood cue και phone path μπαίνουν πιο μπροστά, ακριβώς επειδή το grade έδειξε ότι το σημερινό site underuses Athens-local proof.",
        },
        {
          heading: "Ο γιατρός και οι institutional proof points λειτουργούν ως κύρια πειθώ",
          body: "Αντί για generic medical layout, το demo χτίζει γύρω από τον Δρ. Τριχώνα, τις διεθνείς εκπαιδευτικές αναφορές και το πιο specialist visual treatment.",
        },
      ],
    };
  }

  if (matchesDomain(prospect, "synovus.gr")) {
    return {
      title: "Synovus Orthopaedic Clinic | Premium concept redesign",
      hero: {
        eyebrow: "Orthopaedic team-first redesign",
        headline: "Ορθοπαιδική φροντίδα στην Αθήνα με 4 εξειδικευμένους χειρουργούς και καθαρότερη διαδρομή προς ραντεβού.",
        subheadline:
          "Το demo μεταφέρει τη Synovus από scattered navigation σε σαφή specialist πρόταση για ώμο, γόνατο, ισχίο, άκρα και αθλητικές κακώσεις, με πιο έντονη ομαδική αξιοπιστία από την πρώτη οθόνη.",
      },
      heroBadges: ["4 ορθοπαιδικοί χειρουργοί", "Same Day Clinic", "Πανόρμου / Αθήνα", "Concept demo"],
      heroStats: [
        { label: "Ομάδα", value: "4 χειρουργοί" },
        { label: "Ωράριο", value: "Δευ-Παρ 9πμ-9μμ" },
        { label: "Τηλέφωνο", value: "+30 210 6929896" },
      ],
      heroImageUrl: "https://www.synovus.gr/wp-content/uploads/2025/04/synovus-podoknimikis-astragalos.jpg",
      heroImageAlt: "Synovus Orthopaedic Clinic",
      mediaGallery: [
        {
          url: "https://www.synovus.gr/wp-content/smush-webp/2025/12/Synovus-149.jpg.webp",
          caption: "Χώρος Synovus Orthopaedic Clinic",
          sourceLabel: "Homepage",
          emphasis: "clinic",
        },
        {
          url: "https://www.synovus.gr/wp-content/uploads/2025/04/synovus-podoknimikis-astragalos.jpg",
          caption: "Ποδοκνημικής / Άκρου Ποδός",
          sourceLabel: "Services",
          emphasis: "service",
        },
        {
          url: "https://www.synovus.gr/wp-content/uploads/2026/03/ano-akrou-cheri.jpg",
          caption: "Άνω Άκρου",
          sourceLabel: "Services",
          emphasis: "service",
        },
        {
          url: "https://www.synovus.gr/wp-content/uploads/2025/12/synovus-shoulder.jpg",
          caption: "Τμήμα Ώμου",
          sourceLabel: "Services",
          emphasis: "service",
        },
      ],
      trustItems: [
        "4 εξειδικευμένοι ορθοπαιδικοί χειρουργοί",
        "Same Day Clinic",
        "Λουίζης Ριανκούρ 65-67, Αθήνα 115 23",
        "Δευτέρα έως Παρασκευή 9πμ-9μμ",
        "Ιδιωτικό parking: Καρίστου 8, Αθήνα 115 23",
        "Συλλογική ορθοπαιδική προσέγγιση με κοινή φιλοσοφία ασφάλειας και αφοσίωσης",
      ],
      doctorCards: [
        {
          name: "Ιωάννης Λαχανάς",
          role: "Orthopaedic Surgeon",
          bio: "Μέλος της βασικής χειρουργικής ομάδας της Synovus Orthopaedic Clinic.",
          facts: ["MSc", "FEBOT", "FRCS(Tr&Orth)"],
        },
        {
          name: "Ηλίας Ασλανίδης",
          role: "Orthopaedic Surgeon",
          bio: "Μέλος της βασικής χειρουργικής ομάδας της Synovus Orthopaedic Clinic.",
          facts: ["MD", "MSc", "FEBOT"],
        },
        {
          name: "Αχιλλέας Μπουτσιάδης",
          role: "Orthopaedic Surgeon",
          bio: "Μέλος της βασικής χειρουργικής ομάδας της Synovus Orthopaedic Clinic.",
          facts: ["MD", "PhD"],
        },
        {
          name: "Κωνσταντίνος Παπουτσής",
          role: "Orthopaedic Surgeon",
          bio: "Μέλος της βασικής χειρουργικής ομάδας της Synovus Orthopaedic Clinic.",
          facts: ["MD", "FEBOT", "FRCS (Tr&Orth)"],
        },
      ],
      services: [
        {
          title: "Same Day Clinic",
          eyebrow: "Fast-access care",
          detail: "Το demo τη φέρνει μπροστά ως clear access point για ασθενείς που χρειάζονται γρήγορη αξιολόγηση.",
          imageUrl: "https://www.synovus.gr/wp-content/smush-webp/2025/12/Synovus-149.jpg.webp",
          imageAlt: "Synovus clinic interior",
        },
        {
          title: "Ποδοκνημικής / Άκρου Ποδός",
          eyebrow: "Orthopaedic department",
          detail: "Παρουσιάζεται ως καθαρό specialty block με πιο premium εικόνα και λιγότερη navigation noise.",
          imageUrl: "https://www.synovus.gr/wp-content/uploads/2025/04/synovus-podoknimikis-astragalos.jpg",
          imageAlt: "Ποδοκνημικής / Άκρου Ποδός",
        },
        {
          title: "Άνω Άκρου",
          eyebrow: "Orthopaedic department",
          detail: "Η υπηρεσία ανεβαίνει σε πιο σαφή clinical hierarchy για να καταλαβαίνει ο επισκέπτης εύκολα το εύρος της ομάδας.",
          imageUrl: "https://www.synovus.gr/wp-content/uploads/2026/03/ano-akrou-cheri.jpg",
          imageAlt: "Άνω Άκρου",
        },
        {
          title: "Τμήμα Ώμου",
          eyebrow: "Orthopaedic department",
          detail: "Το demo το κάνει πιο ευκρινές και εύκολα scannable αντί για buried navigation link.",
          imageUrl: "https://www.synovus.gr/wp-content/uploads/2025/12/synovus-shoulder.jpg",
          imageAlt: "Τμήμα Ώμου",
        },
        {
          title: "Ισχίου – Γόνατος",
          eyebrow: "Orthopaedic department",
          detail: "Βοηθά τον επισκέπτη να βρει γρηγορότερα τη σωστή κατεύθυνση θεραπείας.",
          imageUrl: "https://www.synovus.gr/wp-content/smush-webp/2025/12/Synovus-149.jpg.webp",
          imageAlt: "Synovus clinic",
        },
        {
          title: "Αθλητικών κακώσεων",
          eyebrow: "Orthopaedic department",
          detail: "Δίνει πιο σαφή sports-injury signal για ασθενείς που έρχονται με συγκεκριμένη ανάγκη.",
          imageUrl: "https://www.synovus.gr/wp-content/uploads/2025/12/synovus-shoulder.jpg",
          imageAlt: "Αθλητικές κακώσεις",
        },
      ],
      sections: [
        {
          heading: "Η ομάδα γίνεται ορατή πριν χαθεί ο επισκέπτης στο navigation",
          body: "Το redesign μεταφέρει τους 4 χειρουργούς και τη συλλογική φιλοσοφία της Synovus σε πρώτο επίπεδο, ακριβώς επειδή το grade έδειξε αδύναμα doctor trust signals.",
        },
        {
          heading: "Η ορθοπαιδική πρόταση οργανώνεται ανά specialty και όχι ανά scattered links",
          body: "Ώμος, γόνατο, ισχίο, άκρα, αθλητικές κακώσεις και Same Day Clinic παρουσιάζονται ως σαφή specialty blocks με πιο commercial hierarchy.",
        },
        {
          heading: "Η τοπική ευκολία πρόσβασης φαίνεται πιο γρήγορα",
          body: "Διεύθυνση, ωράριο, τηλέφωνο και parking τοποθετούνται πιο μπροστά ώστε η σελίδα να λειτουργεί σαν πραγματικό conversion surface για Αθήνα-based ασθενείς.",
        },
      ],
    };
  }

  return undefined;
}
