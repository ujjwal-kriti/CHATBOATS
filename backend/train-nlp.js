const { NlpManager } = require('node-nlp');
const fs = require('fs');

async function trainNLP() {
    // Initialize NLP Manager with supported languages
    const manager = new NlpManager({ languages: ['en', 'hi', 'te'], forceNER: true });

    // ==================== 1. ATTENDANCE QUERIES ====================
    const attendanceQueries = {
        en: [
            "Does my child attend classes regularly?",
            "check attendance status",
            "how many classes did my son attend?",
            "is his attendance above 75 percent?",
            "can you show the attendance percentage?",
            "how many days was my child present?",
            "Is my daughter attending college daily?",
            "show me the attendance log",
            "I want to see his attendance report",
            "what is the latest attendance record?",
            "percentage of classes attended",
            "is the attendance sufficient?",
            "attendance in sem 1",
            "sem 2 attendance",
            "how many classes in semester 3",
            "sem 4 attendance percentage",
            "attendance %",
            "attendance report",
            "check presence",
            "what is the current attendance",
            "show attendance summary",
            "overall attendance percentage",
            "attendance details",
            "monthly attendance report",
            "attndce", "atendance", "atendnce", "atndnc", "atendanc", "attandance", "atnd", "attd"
        ],
        hi: [
            "क्या मेरा बच्चा नियमित रूप से क्लास में जाता है?",
            "उपस्थिति की जांच करें",
            "मेरे बेटे की उपस्थिति कैसी है?",
            "क्या उसकी उपस्थिति 75 प्रतिशत से ऊपर है?",
            "उपस्थिति रिकॉर्ड दिखाएं",
            "क्या मेरा बच्चा आज कॉलेज गया था?",
            "सेम 1 में अटेंडेंस",
            "सेमेस्टर 2 की उपस्थिति",
            "सेम 3 में कितने दिन गया",
            "अटेंडेंस की स्थिति क्या है?",
            "उपस्थिति का प्रतिशत क्या है?",
            "हाजिरी",
            "प्रेजेंट",
            "अनुपस्थित",
            "अटेंडेंस",
            "वर्तमान उपस्थिति",
            "कुल उपस्थिति प्रतिशत",
            "मासिक उपस्थिति"
        ],
        te: [
            "నా పిల్లవాడు రోజూ కాలేజీకి వెళ్తున్నాడా?",
            "అటెండెన్స్ చెక్ చేయండి",
            "నా పిల్లవాడు ఈ రోజు కాలేజీకి వెళ్లాడా?",
            "అటెండెన్స్ శాతం ఎంత ఉంది?",
            "కాలేజీకి ఎన్ని రోజులు హాజరయ్యాడు?",
            "అటెండెన్స్ 75 శాతం కంటే ఎక్కువగా ఉందా?",
            "సెమ్ 1 లో అటెండెన్స్",
            "సెమిస్టర్ 2 అటెండెన్స్ చెక్ చేయండి",
            "సెమ్ 3 అటెండెన్స్ శాతం",
            "క్లాసులకు క్రమం తప్పకుండా వెళ్తున్నాడా?",
            "హాజరు",
            "ప్రెజెంట్",
            "అటెండెన్స్",
            "ప్రస్తుత హాజరు",
            "మొత్తం హాజరు శాతం"
        ]
    };

    // ==================== 1b. DAILY & HOURLY ATTENDANCE QUERIES ====================
    const dailyAttendanceQueries = {
        en: [
            "was he present on 20th april?",
            "check status for 20-04-2026",
            "was my child present in 2nd hour on 20 april?",
            "status of 2nd hour today",
            "attendance on 15 march",
            "was he present in period 1 on 10th feb?",
            "check 4th period attendance",
            "what was the subject in 3rd hour yesterday?",
            "did he attend lab hour on 20 april?",
            "was he present in ml lab?",
            "attendance in devops lab yesterday",
            "status of hour 5 on 22nd march",
            "attendance for yesterday",
            "was he present today?",
            "hour 2 status",
            "period 3 presence"
        ],
        hi: [
            "क्या वह 20 अप्रैल को उपस्थित था?",
            "20-04-2026 का स्टेटस चेक करें",
            "क्या मेरा बच्चा 20 अप्रैल को दूसरे घंटे में उपस्थित था?",
            "आज के दूसरे घंटे की स्थिति",
            "15 मार्च को हाजिरी",
            "क्या वह 10 फरवरी को पहले पीरियड में था?",
            "चौथे पीरियड की अटेंडेंस चेक करें",
            "कल तीसरे घंटे में कौन सा विषय था?",
            "क्या उसने 20 अप्रैल को लैब अटेंड की?",
            "क्या वह एमएल लैब में प्रेजेंट था?",
            "कल डेवप्स लैब में अटेंडेंस कैसी थी?"
        ],
        te: [
            "అతను ఏప్రిల్ 20న హాజరయ్యాడా?",
            "20-04-2026 స్థితిని తనిఖీ చేయండి",
            "నా బిడ్డ ఏప్రిల్ 20న 2వ గంటలో హాజరయ్యాడా?",
            "ఈరోజు 2వ గంట స్థితి",
            "మార్చి 15న హాజరు",
            "ఫిబ్రవరి 10న 1వ పీరియడ్ లో అతను ఉన్నాడా?",
            "4వ పీరియడ్ అటెండెన్స్ చెక్ చేయండి",
            "నిన్న 3వ గంటలో సబ్జెక్ట్ ఏమిటి?",
            "అతను ఏప్రిల్ 20న ల్యాబ్ కు వెళ్లాడా?",
            "అతను ML ల్యాబ్ లో ఉన్నాడా?",
            "నిన్న మోడరన్ ల్యాబ్ అటెండెన్స్ స్థితి"
        ]
    };

    // Train intents
    attendanceQueries.en.forEach(q => manager.addDocument('en', q, 'attendance.status'));
    attendanceQueries.hi.forEach(q => manager.addDocument('hi', q, 'attendance.status'));
    attendanceQueries.te.forEach(q => manager.addDocument('te', q, 'attendance.status'));

    dailyAttendanceQueries.en.forEach(q => manager.addDocument('en', q, 'attendance.daily'));
    dailyAttendanceQueries.hi.forEach(q => manager.addDocument('hi', q, 'attendance.daily'));
    dailyAttendanceQueries.te.forEach(q => manager.addDocument('te', q, 'attendance.daily'));

    // ==================== 2. CGPA / MARKS QUERIES ====================
    const cgpaQueries = {
        en: [
            "What is my child's current CGPA?",
            "how is his academic performance?",
            "tell me about his grades",
            "what are the total marks scored?",
            "what is his overall percentage?",
            "is he doing well in his studies?",
            "show me the result of the last exam",
            "get my child's performance details",
            "cgpa in sem 1",
            "marks in semester 2",
            "how much cgpa in sem 3",
            "sem 4 result",
            "grades",
            "cgpa",
            "gpa",
            "result",
            "marks list",
            "performance",
            "academic summary",
            "current academic status",
            "grade report",
            "subject wise marks",
            "cgp", "cpga", "cgpaa", "cgppa", "gpaa", "reslt", "performnce", "mrks"
        ],
        hi: [
            "मेरे बच्चे का सीजीपीए कितना है?",
            "उसका अकादमिक प्रदर्शन कैसा है?",
            "उसके ग्रेड के बारे में बताएं",
            "मेरे बच्चे का कुल प्रतिशत क्या है?",
            "कुल प्रतिशत दिखाएं",
            "कुल अकादमिक प्रतिशत क्या है?",
            "सेम 1 का रिजल्ट दिखाएं",
            "सेमेस्टर 2 में कितने मार्क्स आये",
            "सेम 3 का सीजीपीए बताएं",
            "अंक",
            "नंबर",
            "रिजल्ट",
            "कैसा पढ़ रहा है",
            "शैक्षणिक प्रदर्शन",
            "ग्रेड रिपोर्ट"
        ],
        te: [
            "నా పిల్లల CGPA ఎంత?",
            "అతని అకడమిక్ పెర్ఫార్మెన్స్ ఎలా ఉంది?",
            "నా పిల్లల మొత్తం శాతం ఎంత?",
            "మొత్తం అకడమిక్ శాతం చూపించండి",
            "మొత్తం శాతం ఎంత?",
            "సెమ్ 1 లో సిజిపిఎ ఎంత",
            "సెమిస్టర్ 2 మార్కులు చూపించు",
            "సెమ్ 3 రిజల్ట్",
            "మార్కులు",
            "రిజల్ట్",
            "సిజిపిఎ",
            "గ్రేడ్ రిపోర్ట్",
            "అకడమిక్ పెర్ఫార్మెన్స్",
            "మార్కులు ఎంత",
            "సిజిపి ఎంత",
            "రిజల్ట్ ఏది",
            "గ్రేడ్ ఎంత"
        ]
    };

    // ==================== 3. FEES QUERY (ENHANCED) ====================
    const feesQueries = {
        en: [
            "What is the fee payment status?",
            "is there any fee balance?",
            "Is there any fee pending?",
            "Do I have any fee balance?",
            "how much money is pending for college fees?",
            "has the semester fee been paid?",
            "how many pending fees are there",
            "is there any fees pending for sem 1",
            "sem 2 fees status",
            "semester 3 pending fees check",
            "is there any outstanding amount?",
            "check my child's financial status",
            "fees",
            "pay",
            "due",
            "money",
            "receipt",
            "show me fee payment history",
            "last fee payment date",
            "when was the last fee paid?",
            "fee receipt for last payment",
            "show all fee receipts",
            "total fees paid till now",
            "how much fee paid so far?",
            "fee breakdown by semester",
            "semester wise fee details",
            "payment transactions",
            "fee payment records",
            "when is the next fee due?",
            "next fee payment date",
            "upcoming fee deadlines",
            "fee due date for next semester",
            "when should I pay next fees?",
            "fee schedule for this year",
            "next payment reminder",
            "detailed fee breakup",
            "what does pending fee include?",
            "tuition fee status",
            "hostel fee pending?",
            "exam fee paid or not?",
            "development fee balance",
            "library fee status",
            "transport fee pending",
            "how to pay fees?",
            "online fee payment options",
            "fee payment modes available",
            "can I pay in installments?",
            "late fee penalty details",
            "is there any scholarship?",
            "fee concession available?",
            "any discount on fees?",
            "merit scholarship status",
            "financial aid options",
            "show fees from dashboard",
            "fee status as shown in dashboard",
            "pending fees amount",
            "clear all dues",
            "fee summary",
            "total fee pending",
            "fee balance",
            "outstanding fees",
            "fee due amount",
            "college fee details",
            "fees", "fess", "feees", "paymnt", "panding fee", "pendng fees"
        ],
        hi: [
            "फीस की स्थिति क्या है?",
            "क्या कोई फीस बकाया है?",
            "क्या कोई फीस बाकी है?",
            "फीस भुगतान की स्थिति क्या है?",
            "कॉलेज की फीस के लिए कितना पैसा लंबित है?",
            "क्या सेमेस्टर की फीस जमा कर दी गई है?",
            "सेम 1 की फीस बाकी है क्या",
            "सेमेस्टर 2 की फीस स्थिति",
            "सेम 3 में कोई फीस बकाया है?",
            "क्या कोई बकाया राशि है?",
            "मेरे बच्चे की वित्तीय स्थिति की जांच करें",
            "फीस",
            "बकाया",
            "पैसे",
            "रसीद",
            "फीस भुगतान इतिहास दिखाएं",
            "आखिरी फीस कब जमा हुई?",
            "फीस की रसीद दिखाएं",
            "अब तक कितनी फीस जमा हुई?",
            "सेमेस्टर वार फीस विवरण",
            "भुगतान लेनदेन",
            "अगली फीस कब देनी है?",
            "फीस जमा करने की आखिरी तारीख",
            "अगली फीस की तारीख",
            "फीस शेड्यूल",
            "फीस का विस्तृत विवरण",
            "ट्यूशन फीस का क्या है?",
            "होस्टल फीस बकाया है क्या?",
            "परीक्षा फीस जमा है क्या",
            "ऑनलाइन फीस कैसे जमा करें?",
            "फीस जमा करने के तरीके",
            "क्या किश्तों में फीस जमा कर सकते हैं",
            "क्या कोई छूट मिलती है?",
            "स्कॉलरशिप की स्थिति",
            "मेरिट स्कॉलरशिप",
            "डैशबोर्ड में फीस कैसे दिखती है",
            "कुल कितनी फीस बाकी है",
            "फीस सारांश",
            "बकाया राशि"
        ],
        te: [
            "ఫీజు స్థితి ఏమిటి?",
            "ఏమైనా ఫీజు బకాయి ఉందా?",
            "ఫీజు చెల్లింపు స్థితి ఏమిటి?",
            "ఫీజు బ్యాలెన్స్ ఉందా?",
            "కాలేజీ ఫీజు ఇంకా ఎంత కట్టాలి?",
            "సెమిస్టర్ ఫీజు చెల్లించారా?",
            "సెమ్ 1 ఫీజు ఏమైనా పెండింగ్ ఉందా",
            "సెమిస్టర్ 2 ఫీజు చెల్లించారా",
            "సెమ్ 3 ఫీజు బ్యాలెన్స్ ఉందా",
            "ఏమైనా బకాయిలు ఉన్నాయా?",
            "నా బిడ్డ ఆర్థిక స్థితిని తనిఖీ చేయండి",
            "ఫీజు",
            "బకాయి",
            "డబ్బులు",
            "పేమెంట్",
            "ఫీజు చెల్లింపు చరిత్ర చూపించు",
            "చివరిగా ఫీజు ఎప్పుడు కట్టారు?",
            "ఫీజు రసీదు చూపించు",
            "ఇప్పటివరకు ఎంత ఫీజు కట్టారు?",
            "సెమిస్టర్ వారీ ఫీజు వివరాలు",
            "తదుపరి ఫీజు ఎప్పుడు కట్టాలి?",
            "ఫీజు చెల్లింపు గడువు ఎప్పుడు",
            "తదుపరి ఫీజు తేదీ",
            "ఫీజు వివరాలు",
            "హాస్టల్ ఫీజు స్థితి ఏమిటి?",
            "పరీక్ష ఫీజు చెల్లించారా",
            "ఫీజు ఎలా చెల్లించాలి",
            "ఆన్‌లైన్ ఫీజు చెల్లింపు",
            "ఏమైనా తగ్గింపు ఉందా?",
            "స్కాలర్‌షిప్ స్థితి",
            "డ్యాష్‌బోర్డ్ లో ఫీజు ఎలా ఉంది",
            "మొత్తం ఎంత బకాయి ఉంది",
            "ఫీజు సారాంశం"
        ]
    };

    // ==================== 4. FEES DEADLINE QUERY ====================
    const feesDeadlineQueries = {
        en: [
            "What is the last date for fee payment?",
            "When is the fee payment deadline?",
            "When should the fee be paid?",
            "tell me the final date for paying fees",
            "last day to pay college fees",
            "fee payment schedule",
            "fee due date",
            "last date to avoid late fee",
            "fee deadline for this semester"
        ],
        hi: [
            "फीस जमा करने की अंतिम तिथि क्या है?",
            "फीस भुगतान की आखिरी तारीख क्या है?",
            "फीस कब तक जमा करनी है?",
            "फीस भरने की डेडलाइन क्या है?",
            "अंतिम तिथि बताएं",
            "फीस की अंतिम तारीख",
            "लेट फीस से बचने की आखिरी तारीख"
        ],
        te: [
            "ఫీజు చెల్లించడానికి చివరి తేదీ ఏమిటి?",
            "ఫీజు చెల్లింపు గడువు ఎప్పుడు?",
            "ఫీజు ఎప్పటికి చెల్లించాలి?",
            "ఫీజు కట్టడానికి లాస్ట్ డేట్ ఎప్పుడు?",
            "ఫీజు గడువు వివరాలు",
            "చివరి తేదీ",
            "ఆలస్యం ఫీజు లేకుండా చెల్లించడానికి చివరి తేదీ"
        ]
    };

    // ==================== 5. BACKLOGS QUERY ====================
    const backlogsQueries = {
        en: [
            "Does my child have any backlogs?",
            "check for failed subjects",
            "how many subjects are remaining to clear?",
            "has he passed all the exams?",
            "list the active backlogs",
            "is there any pending subject?",
            "did my daughter fail any subject?",
            "any backlogs in sem 1",
            "sem 2 backlogs check",
            "how many failed subjects in semester 3",
            "sem 4 backlogs list",
            "backlog",
            "fail",
            "failed",
            "arrears",
            "pending subjects",
            "subjects to clear",
            "failed exams list",
            "back", "re", "clearance", "arrear", "pendings", "total backlogs", "fail list",
            "backlogs", "backloggs", "bklog", "bcklog", "fail subjects", "falied subjects", "fialed"
        ],
        hi: [
            "क्या कोई बैकलॉग है?",
            "क्या वह सभी विषयों में पास है?",
            "कितने विषय क्लियर करने बाकी हैं?",
            "क्या उसने सभी परीक्षाएं पास कर ली हैं?",
            "सक्रिय बैकलॉग की सूची दिखाएं",
            "क्या कोई लंबित विषय है?",
            "सेम 1 में कोई बैकलॉग है क्या",
            "सेमेस्टर 2 में कितने फेल सब्जेक्ट हैं",
            "सेम 3 में बैक है क्या",
            "फेल सब्जेक्ट्स की लिस्ट",
            "बैकलॉग का विवरण दें",
            "फेल",
            "बैक",
            "लंबित विषय",
            "क्लियर करने वाले विषय",
            "फैल", "कितने बैक हैं", "बैक लिस्ट", "पेंडिंग"
        ],
        te: [
            "ఏమైనా బ్యాక్లాగ్స్ ఉన్నాయా?",
            "అన్ని సబ్జెక్టులు క్లియర్ అయ్యాయా?",
            "ఇంకా ఎన్ని సబ్జెక్టులు రాయాల్సి ఉంది?",
            "నా బిడ్డ అన్ని పరీక్షల్లో ఉత్తీర్ణత సాధించాడా?",
            "బ్యాక్‌లాగ్‌ల జాబితాను చూపించు",
            "పెండింగ్‌లో ఉన్న సబ్జెక్టులు ఏవి?",
            "సెమ్ 1 లో ఏమైనా బ్యాక్లాగ్స్ ఉన్నాయా",
            "సెమిస్టర్ 2 ఫెయిల్ సబ్జెక్ట్స్ ఎన్ని",
            "సెమ్ 3 లో బ్యాక్ ఉందా",
            "ఫెయిల్ అయిన సబ్జెక్టుల లిస్ట్ ఇవ్వు",
            "ఏవైనా సబ్జెక్టులు మిగిలి ఉన్నాయా?",
            "ఫెయిల్",
            "బ్యాక్లాగ్",
            "పెండింగ్ సబ్జెక్టులు",
            "బాకీ", "బ్యాక్", "ఫెయిల్ లిస్ట్"
        ]
    };

    // ==================== 6. EVENTS / SCHEDULE QUERY ====================
    const eventsQueries = {
        en: [
            "When is the next exam?",
            "What is the exam schedule?",
            "When are the upcoming exams?",
            "Show the exam timetable",
            "What is the holiday schedule?",
            "Are there any upcoming holidays?",
            "Show the holiday list",
            "tell me about upcoming college events",
            "is there any parent-teacher meeting?",
            "what are the campus announcements?",
            "any holidays coming up?",
            "show the academic calendar",
            "when will the semester end?",
            "show me the notification board",
            "when are the mid exams?",
            "important dates in college",
            "exam dates",
            "holiday calendar",
            "college events"
        ],
        hi: [
            "परीक्षा का समय सारणी क्या है?",
            "अगली परीक्षा कब है?",
            "परीक्षा का टाइमटेबल दिखाएं",
            "छुट्टियों का कार्यक्रम क्या है?",
            "क्या कोई आने वाली छुट्टियाँ हैं?",
            "छुट्टियों की सूची दिखाएं",
            "आने वाले कॉलेज कार्यक्रमों के बारे में बताएं",
            "क्या कोई शिक्षक-अभिभावक बैठक है?",
            "कैंपस की घोषणाएं क्या हैं?",
            "अकादमिक कैलेंडर दिखाएं",
            "सेमेस्टर कब समाप्त होगा?",
            "मिड टर्म परीक्षाएं कब हैं?",
            "महत्वपूर्ण तिथियों के बारे में बताएं",
            "परीक्षा तिथियाँ",
            "छुट्टियों का कैलेंडर"
        ],
        te: [
            "పరీక్షల షెడ్యూల్ ఏమిటి?",
            "వచ్చే పరీక్షలు ఎప్పుడు ఉన్నాయి?",
            "పరీక్షల టైమ్టేబుల్ చూపించండి",
            "సెలవుల షెడ్యూల్ ఏమిటి?",
            "రాబోయే సెలవులు ఏమైనా ఉన్నాయా?",
            "సెలవుల జాబితా చూపించండి",
            "రాబోయే కాలేజీ ఈవెంట్ల గురించి చెప్పు",
            "పేరెంట్-టీచర్ మీటింగ్ ఉందా?",
            "క్యాంపస్ ప్రకటనలు ఏమిటి?",
            "అకాడమిక్ క్యాలెండర్‌ను చూపించు",
            "సెమిస్టర్ ఎప్పుడు ముగుస్తుంది?",
            "ముఖ్యమైన తేదీల వివరాలు",
            "మిడ్ ఎగ్జామ్స్ ఎప్పుడు ఉంటాయి?",
            "నోటిఫికేషన్ బోర్డు చూపించు",
            "పరీక్ష తేదీలు",
            "సెలవుల క్యాలెండర్"
        ]
    };

    // ==================== 7. SUMMARY / PERFORMANCE QUERY ====================
    const summaryQueries = {
        en: [
            "What is my child's overall performance?",
            "Show the performance summary",
            "How is my child doing academically?",
            "Give me a summary of my child's progress",
            "how is the overall student status?",
            "brief me on his performance",
            "is everything okay with his studies?",
            "overall report of the student",
            "summary of attendance and marks",
            "how is he doing overall?",
            "is the student performing well overall?",
            "status report for my child",
            "summary",
            "report",
            "overall",
            "stats",
            "complete performance report",
            "academic summary report"
        ],
        hi: [
            "मेरे बच्चे का समग्र प्रदर्शन कैसा है?",
            "प्रदर्शन का सारांश दिखाएं",
            "मेरा बच्चा पढ़ाई में कैसा कर रहा है?",
            "मेरे बच्चे की प्रगति का सारांश दें",
            "छात्र की कुल स्थिति कैसी है?",
            "क्या उसकी पढ़ाई ठीक चल रही है?",
            "अटेंडेंस और मार्क्स का सारांश",
            "कुल मिलाकर वह कैसा कर रहा है?",
            "बच्चे का स्टेटस रिपोर्ट",
            "संपूर्ण प्रदर्शन रिपोर्ट"
        ],
        te: [
            "నా పిల్లల మొత్తం ప్రదర్శన ఎలా ఉంది?",
            "ప్రదర్శన సారాంశం చూపించండి",
            "నా పిల్లవాడు చదువులో ఎలా చేస్తున్నాడు?",
            "నా బిడ్డ పురోగతి సారాంశం ఇవ్వండి",
            "విద్యార్థి మొత్తం స్థితి ఎలా ఉంది?",
            "అతని పనితీరు గురించి క్లుప్తంగా చెప్పండి",
            "అటెండెన్స్ మరియు మార్కుల సారాంశం",
            "మొత్తం మీద అతను ఎలా ఉన్నాడు?",
            "పిల్లల స్టేటస్ రిపోర్ట్",
            "విద్యార్థి మొత్తం ప్రొగ్రెస్ రిపోర్ట్ ఇవ్వు",
            "చదువు ఎలా సాగుతోంది?",
            "అన్నీ బాగున్నాయా?"
        ]
    };

    // ==================== 8. WEAK SUBJECTS QUERY ====================
    const weakSubjectQueries = {
        en: [
            "In which subject is my child weak?",
            "Which subject needs improvement?",
            "Where is my child performing poorly?",
            "show me the subject with lowest marks",
            "is he struggling in any particular topic?",
            "list subjects that need focus",
            "difficult subjects",
            "subjects to improve",
            "lowest marks subjects"
        ],
        hi: [
            "मेरा बच्चा किस विषय में कमजोर है?",
            "किस विषय में सुधार की जरूरत है?",
            "मेरा बच्चा किस विषय में कमजोर प्रदर्शन कर रहा है?",
            "सबसे कम अंक किस विषय में हैं?",
            "किन विषयों पर ध्यान देने की आवश्यकता है?",
            "सुधार वाले विषय"
        ],
        te: [
            "నా పిల్లవాడు ఏ సబ్జెక్ట్లో బలహీనంగా ఉన్నాడు?",
            "ఏ సబ్జెక్ట్లో మెరుగుదల అవసరం ఉంది?",
            "నా పిల్లవాడు ఏ సబ్జెక్ట్లో తక్కువగా చేస్తున్నాడు?",
            "ఏ సబ్జెక్టులో తక్కువ మార్కులు వచ్చాయి?",
            "ఏ సబ్జెక్టులపై ఎక్కువ దృష్టి పెట్టాలి?"
        ]
    };

    // ==================== 8b. STRONG SUBJECTS QUERY ====================
    const strongSubjectQueries = {
        en: [
            "In which subject is my child strong?",
            "highest marks in which subject",
            "where did my child score most",
            "best performing subjects",
            "top marks subjects",
            "strongest subjects",
            "where does he excel?",
            "excellent performance in which topic"
        ],
        hi: [
            "मेरा बच्चा किस विषय में सबसे अच्छा है?",
            "किस विषय में सबसे अधिक अंक मिले हैं?",
            "सबसे अच्छे प्रदर्शन वाले विषय",
            "मेरा बच्चा किस विषय में होशियार है?",
            "टॉप मार्क्स किसमें हैं?"
        ],
        te: [
            "నా పిల్లవాడు ఏ సబ్జెక్టులో బలంగా ఉన్నాడు?",
            "ఏ సబ్జెక్టులో అత్యధిక మార్కులు వచ్చాయి?",
            "నా బిడ్డ దేనిలో రాణిస్తున్నాడు?",
            "అత్యంత బలమైన సబ్జెక్టులు",
            "టాప్ మార్క్స్ సబ్జెక్టులు"
        ]
    };

    // ==================== 9. EXTRACURRICULAR / ACTIVITIES QUERY ====================
    const activitiesQueries = {
        en: [
            "Is my child participating in extracurricular activities?",
            "Did my child join any clubs or activities?",
            "Is my child active in sports or clubs?",
            "participation in extra activities",
            "is he involved in sports?",
            "tell me about his club activities",
            "co-curricular activities",
            "sports participation"
        ],
        hi: [
            "क्या मेरा बच्चा किसी अतिरिक्त गतिविधि में भाग ले रहा है?",
            "क्या मेरा बच्चा किसी क्लब में शामिल है?",
            "क्या मेरा बच्चा खेल या गतिविधियों में भाग ले रहा है?",
            "अतिरिक्त गतिविधियों में भागीदारी",
            "क्या वह खेलों में सक्रिय है?"
        ],
        te: [
            "నా పిల్లవాడు ఏమైనా అదనపు కార్యకలాపాలలో పాల్గొంటున్నాడా?",
            "నా పిల్లవాడు ఏదైనా క్లబ్లో ఉన్నాడా?",
            "నా పిల్లవాడు క్రీడలు లేదా కార్యక్రమాల్లో పాల్గొంటున్నాడా?",
            "అదనపు కార్యక్రమాల వివరాలు",
            "నా కుమారుడు ఆటలలో పాల్గొంటున్నాడా?"
        ]
    };

    // ==================== 10. ACHIEVEMENTS / CERTIFICATES QUERY ====================
    const achievementsQueries = {
        en: [
            "Did my child receive any certificates?",
            "Has my child won any awards?",
            "Any achievements by my child?",
            "did he get any prize?",
            "show me recent certificates gained",
            "list awards won by the student",
            "achievements list",
            "certificates received"
        ],
        hi: [
            "क्या मेरे बच्चे को कोई प्रमाणपत्र मिला है?",
            "क्या मेरे बच्चे ने कोई पुरस्कार जीता है?",
            "क्या मेरे बच्चे की कोई उपलब्धि है?",
            "क्या उसे कोई इनाम मिला है?",
            "हाल के प्रमाणपत्र दिखाएं"
        ],
        te: [
            "నా పిల్లవాడికి ఏమైనా సర్టిఫికేట్ వచ్చిందా?",
            "నా పిల్లవాడు ఏమైనా అవార్డు గెలిచాడా?",
            "నా పిల్లవాడికి ఏమైనా విజయాలు ఉన్నాయా?",
            "సర్టిఫికేట్లు ఏమైనా వచ్చాయా?",
            "పిల్లల విజయాల వివరాలు కావాలి"
        ]
    };

    // ==================== 11. STUDENT DATA QUERY ====================
    const studentQueries = {
        en: [
            "who is this student?",
            "show student profile details",
            "registration number and branch info",
            "tell me about the student",
            "which semester is he in?",
            "what is his name and roll number?",
            "branch and semester details",
            "student information",
            "profile details"
        ],
        hi: [
            "यह छात्र कौन है?",
            "छात्र प्रोफाइल विवरण दिखाएं",
            "पंजीकरण संख्या और विभाग की जानकारी",
            "छात्र के बारे में बताएं",
            "वह कौन से सेमेस्टर में है?",
            "उसका नाम और रोल नंबर क्या है?"
        ],
        te: [
            "ఈ విద్యార్థి ఎవరు?",
            "విద్యార్థి ప్రొఫైల్ వివరాలను చూపించు",
            "రిజిస్ట్రేషన్ నంబర్ మరియు బ్రాంచ్ వివరాలు",
            "విద్యార్థి గురించి చెప్పండి",
            "అతను ఏ సెమిస్టర్‌లో ఉన్నాడు?",
            "అతని పేరు మరియు రోల్ నంబర్ ఏమిటి?"
        ]
    };
    
    // ==================== 11b. CONTACT QUERIES ====================
    const contactQueries = {
        en: [
            "who is the class advisor?", "contact details for teacher", "how to contact faculty?",
            "who is the mentor?", "advisor email", "phone number of advisor", "faculty contacts",
            "contact information", "teacher contact", "advisor details"
        ],
        hi: [
            "टीचर का नंबर क्या है?", "क्लास एडवाइजर कौन है?", "फैकल्टी से कैसे संपर्क करें?", "एडवाइजर का ईमेल",
            "संपर्क जानकारी", "शिक्षक का संपर्क", "एडवाइजर विवरण"
        ],
        te: [
            "క్లాస్ అడ్వైజర్ ఎవరు?", "టీచర్ ఫోన్ నంబర్ ఎంత?", "ఫ్యాకల్టీని ఎలా సంప్రదించాలి?", "అడ్వైజర్ ఈమెయిల్",
            "సంప్రదింపు సమాచారం", "టీచర్ కాంటాక్ట్", "అడ్వైజర్ వివరాలు"
        ]
    };

    const counsellorQueries = {
        en: [
            "I want to talk to my child counsellor", "contact for counsellor", "who is the child counsellor?",
            "need mental health support for student", "counselling services", "talk to doctor",
            "psychologist contact", "can I speak with the counsellor?", "help from counsellor",
            "student counselling info", "counselor", "counsellor"
        ],
        hi: [
            "मुझे काउंसलर से बात करनी है", "काउंसलर का संपर्क", "चाइल्ड काउंसलर कौन है?",
            "छात्र के लिए परामर्श", "डॉक्टर से बात करनी है", "काउंसलर से मदद"
        ],
        te: [
            "నేను కౌన్సిలర్‌తో మాట్లాడాలి", "కౌన్సిలర్ కాంటాక్ట్", "చైల్డ్ కౌన్సిలర్ ఎవరు?",
            "విద్యార్థి కోసం కౌన్సెలింగ్", "కౌన్సిలర్ సహాయం"
        ]
    };
    
    // ==================== 12. GRAPHS / VISUALS QUERY ====================
    const graphsQueries = {
        en: [
            "show me the graphs",
            "chart",
            "visualize performance",
            "attendance graph",
            "cgpa chart",
            "analytics",
            "performance chart",
            "trend analysis"
        ],
        hi: [
            "ग्राफ दिखाएं",
            "चार्ट दिखाएं",
            "प्रगति चार्ट",
            "प्रदर्शन ग्राफ"
        ],
        te: [
            "గ్రాఫ్‌లు చూపించు",
            "చార్ట్ చూపించు",
            "ప్రోగ్రెస్ చార్ట్",
            "పెర్ఫార్మెన్స్ గ్రాఫ్"
        ]
    };

    // ==================== 13. SEMESTER-WISE CGPA QUERIES (WITH TYPOS & GPA) ====================
    const semCgpaQueries = {
        en: [
            // Standard CGPA queries
            "what is cgpa in sem 1", "sem 1 cgpa", "show semester 1 cgpa", "cgpa for sem 1", "semester 1 performance",
            "what is cgpa in sem 2", "sem 2 cgpa", "show semester 2 cgpa", "cgpa for sem 2", "semester 2 performance",
            "what is cgpa in sem 3", "sem 3 cgpa", "show semester 3 cgpa", "cgpa for sem 3", "semester 3 performance",
            "what is cgpa in sem 4", "sem 4 cgpa", "show semester 4 cgpa", "cgpa for sem 4", "semester 4 performance",
            "what is cgpa in sem 5", "sem 5 cgpa", "show semester 5 cgpa", "cgpa for sem 5", "semester 5 performance",
            "what is cgpa in sem 6", "sem 6 cgpa", "show semester 6 cgpa", "cgpa for sem 6", "semester 6 performance",
            
            // GPA variations (CRITICAL - map GPA to CGPA)
            "what is gpa in sem 1", "sem 1 gpa", "gpa for sem 1", "gpa in semester 1",
            "what is gpa in sem 2", "sem 2 gpa", "gpa for sem 2", "gpa in semester 2",
            "what is gpa in sem 3", "sem 3 gpa", "gpa for sem 3", "gpa in semester 3",
            "what is gpa in sem 4", "sem 4 gpa", "gpa for sem 4", "gpa in semester 4",
            "what is gpa in sem 5", "sem 5 gpa", "gpa for sem 5", "gpa in semester 5",
            "what is gpa in sem 6", "sem 6 gpa", "gpa for sem 6", "gpa in semester 6",
            
            // TYPO VARIATIONS (CRITICAL - fix "same" instead of "sem")
            "can you tell me the cgpa of my child in same 1",
            "can you tell me the cgpa of my child in same 2",
            "can you tell me the cgpa of my child in same 3",
            "can you tell me the cgpa of my child in same 4",
            "can you tell me the cgpa of my child in same 5",
            "can you tell me the cgpa of my child in same 6",
            "can you tell me the gpa of my child in same 1",
            "can you tell me the gpa of my child in same 2",
            "can you tell me the gpa of my child in same 3",
            "can you tell me the gpa of my child in same 4",
            "can you tell me the gpa of my child in same 5",
            "can you tell me the gpa of my child in same 6",
            "gpa in same 1", "gpa in same 2", "gpa in same 3", "gpa in same 4", "gpa in same 5", "gpa in same 6",
            "cgpa in same 1", "cgpa in same 2", "cgpa in same 3", "cgpa in same 4", "cgpa in same 5", "cgpa in same 6",
            "what is gpa in same 1", "what is gpa in same 2", "what is gpa in same 3", "what is gpa in same 4", "what is gpa in same 5", "what is gpa in same 6",
            "tell me gpa in same 1", "tell me gpa in same 2", "tell me gpa in same 3", "tell me gpa in same 4", "tell me gpa in same 5", "tell me gpa in same 6",
            "my child's gpa in same 1", "my child's gpa in same 2", "my child's gpa in same 3", "my child's gpa in same 4", "my child's gpa in same 5", "my child's gpa in same 6",
            
            // More natural variations
            "what's my child's gpa for semester 1", "what's my child's gpa for semester 2", "what's my child's gpa for semester 3",
            "what's my child's gpa for semester 4", "what's my child's gpa for semester 5", "what's my child's gpa for semester 6",
            "tell me the semester 1 gpa", "tell me the semester 2 gpa", "tell me the semester 3 gpa",
            "tell me the semester 4 gpa", "tell me the semester 5 gpa", "tell me the semester 6 gpa",
            "gpa for second semester", "gpa for third semester", "gpa for fourth semester", "gpa for fifth semester", "gpa for sixth semester",
            "first semester gpa", "second semester gpa", "third semester gpa", "fourth semester gpa", "fifth semester gpa", "sixth semester gpa",
            
            "show me the cgpa for semester 1", "how much cgpa in sem 2", "get sem 3 gpa", "semester 4 gpa result", "sem 5 total gpa",
            "cgpa in second semester", "first semester cgpa", "third sem gpa", "fourth sem result", "fifth semester score", "sixth sem grade"
        ],
        hi: [
            "सेम 1 में सीजीपीए क्या है", "सेम 1 सीजीपीए", "सेमेस्टर 1 सीजीपीए दिखाओ", "सेम 1 के लिए सीजीपीए", "सेमेस्टर 1 प्रदर्शन",
            "सेम 2 में सीजीपीए क्या है", "सेम 2 सीजीपीए", "सेमेस्टर 2 सीजीपीए दिखाओ", "सेम 2 के लिए सीजीपीए", "सेमेस्टर 2 प्रदर्शन",
            "सेम 3 में सीजीपीए क्या है", "सेम 3 सीजीपीए", "सेमेस्टर 3 सीजीपीए दिखाओ", "सेम 3 के लिए सीजीपीए", "सेमेस्टर 3 प्रदर्शन",
            "सेम 4 में सीजीपीए क्या है", "सेम 4 सीजीपीए", "सेमेस्टर 4 सीजीपीए दिखाओ", "सेम 4 के लिए सीजीपीए", "सेमेस्टर 4 प्रदर्शन",
            "सेम 5 में सीजीपीए क्या है", "सेम 5 सीजीपीए", "सेमेस्टर 5 सीजीपीए दिखाओ", "सेम 5 के लिए सीजीपीए", "सेमेस्टर 5 प्रदर्शन",
            "सेम 6 में सीजीपीए क्या है", "सेम 6 सीजीपीए", "सेमेस्टर 6 सीजीपीए दिखाओ", "सेम 6 के लिए सीजीपीए", "सेमेस्टर 6 प्रदर्शन",
            "सेमेस्टर 1 का सीजीपीए दिखाएं", "सेम 2 में कितना सीजीपीए है", "सेम 3 का जीपीए", "सेमेस्टर 4 जीपीए परिणाम", "सेम 5 कुल जीपीए",
            
            // GPA variations in Hindi
            "सेम 1 में जीपीए क्या है", "सेम 1 जीपीए", "सेम 2 में जीपीए क्या है", "सेम 2 जीपीए",
            "सेम 3 में जीपीए क्या है", "सेम 3 जीपीए", "सेम 4 में जीपीए क्या है", "सेम 4 जीपीए",
            "सेम 5 में जीपीए क्या है", "सेम 5 जीपीए", "सेम 6 में जीपीए क्या है", "सेम 6 जीपीए",

            // Short-form (Small words) Hindi
            "सेम 1 नंबर", "सेम 2 नंबर", "सेम 3 नंबर", "सेम 4 नंबर", "सेम 5 नंबर", "सेम 6 नंबर",
            "नंबर 1", "नंबर 2", "नंबर 3", "नंबर 4", "नंबर 5", "नंबर 6",
            "अंक 1", "अंक 2", "अंक 3", "अंक 4", "अंक 5", "अंक 6",
            "सेम 1 रिजल्ट", "सेम 2 रिजल्ट", "सेम 3 रिजल्ट", "सेम 4 रिजल्ट", "सेम 5 रिजल्ट", "सेम 6 रिजल्ट"
        ],
        te: [
            "సెమ్ 5 లో జిపిఎ ఎంత", "సెమ్ 5 జిపిఎ", "సెమ్ 6 లో జిపిఎ ఎంత", "సెమ్ 6 జిపిఎ",

            // Short-form (Small words) Telugu
            "సెమ్ 1 మార్కులు", "సెమ్ 2 మార్కులు", "సెమ్ 3 మార్కులు", "సెమ్ 4 మార్కులు", "సెమ్ 5 మార్కులు", "సెమ్ 6 మార్కులు",
            "మార్కులు 1", "మార్కులు 2", "మార్కులు 3", "మార్కులు 4", "మార్కులు 5", "మార్కులు 6",
            "సెమ్ 1 రిజల్ట్", "సెమ్ 2 రిజల్ట్", "సెమ్ 3 రిజల్ట్", "సెమ్ 4 రిజల్ట్", "సెమ్ 5 రిజల్ట్", "సెమ్ 6 రిజల్ట్",
            "పాయింట్లు 1", "పాయింట్లు 2", "పాయింట్లు 3", "పాయింట్లు 4", "పాయింట్లు 5", "పాయింట్లు 6"
        ]
    };

    // ==================== 14. SEMESTER-WISE ATTENDANCE QUERIES ====================
    const semAttendanceQueries = {
        en: [
            "sem 1 attendance", "attendance in semester 1", "show sem 1 attendance percentage", "how is attendance in sem 1", "semester 1 presence",
            "sem 2 attendance", "attendance in semester 2", "show sem 2 attendance percentage", "how is attendance in sem 2", "semester 2 presence",
            "sem 3 attendance", "attendance in semester 3", "show sem 3 attendance percentage", "how is attendance in sem 3", "semester 3 presence",
            "sem 4 attendance", "attendance in semester 4", "show sem 4 attendance percentage", "how is attendance in sem 4", "semester 4 presence",
            "sem 5 attendance", "attendance in semester 5", "show sem 5 attendance percentage", "how is attendance in sem 5", "semester 5 presence",
            "sem 6 attendance", "attendance in semester 6", "show sem 6 attendance percentage", "how is attendance in sem 6", "semester 6 presence",
            "check sem 1 attendance", "get attendance for semester 2", "show me sem 3 attendance", "is sem 4 attendance okay", "percentage for sem 5",
            "first sem attendance", "second semester attendance", "third sem presence"
        ],
        hi: [
            "सेम 1 अटेंडेंस", "सेमेस्टर 1 में उपस्थिति", "सेम 1 अटेंडेंस प्रतिशत दिखाओ", "सेम 1 में अटेंडेंस कैसी है", "सेमेस्टर 1 हाजिरी",
            "सेम 2 अटेंडेंस", "सेमेस्टर 2 में उपस्थिति", "सेम 2 अटेंडेंस प्रतिशत दिखाओ", "सेम 2 में अटेंडेंस कैसी है", "सेमेस्टर 2 हाजिरी",
            "सेम 3 अटेंडेंस", "सेमेस्टर 3 में उपस्थिति", "सेम 3 अटेंडेंस प्रतिशत दिखाओ", "सेम 3 में अटेंडेंस कैसी है", "सेमेस्टर 3 हाजिरी",
            "सेम 4 अटेंडेंस", "सेमेस्टर 4 में उपस्थिति", "सेम 4 अटेंडेंस प्रतिशत दिखाओ", "सेम 4 में अटेंडेंस कैसी है", "सेमेस्टर 4 हाजिरी",
            "सेम 5 अटेंडेंस", "सेमेस्टर 5 में उपस्थिति", "सेम 5 अटेंडेंस प्रतिशत दिखाओ", "सेम 5 में अटेंडेंस कैसी है", "सेमेस्टर 5 हाजिरी",
            "सेम 6 अटेंडेंस", "सेमेस्टर 6 में उपस्थिति", "सेम 6 अटेंडेंस प्रतिशत दिखाओ", "सेम 6 में अटेंडेंस कैसी है", "सेमेस्टर 6 हाजिरी",
            "सेम 1 उपस्थिति की जांच करें", "सेमेस्टर 2 के लिए अटेंडेंस प्राप्त करें", "मुझे सेम 3 की उपस्थिति दिखाएं", "क्या सेम 4 की उपस्थिति ठीक है", "सेम 5 के लिए प्रतिशत"
        ],
        te: [
            "సెమ్ 1 అటెండెన్స్", "సెమిస్టర్ 1 లో హాజరు", "సెమ్ 1 అటెండెన్స్ శాతం చూపించు", "సెమ్ 1 లో అటెండెన్స్ ఎలా ఉంది", "సెమిస్టర్ 1 హాజరు",
            "సెమ్ 2 అటెండెన్స్", "సెమిస్టర్ 2 లో హాజరు", "సెమ్ 2 అటెండెన్స్ శాతం చూపించు", "సెమ్ 2 లో అటెండెన్స్ ఎలా ఉంది", "సెమిస్టర్ 2 హాజరు",
            "సెమ్ 3 అటెండెన్స్", "సెమిస్టర్ 3 లో హాజరు", "సెమ్ 3 అటెండెన్స్ శాతం చూపించు", "సెమ్ 3 లో అటెండెన్స్ ఎలా ఉంది", "సెమిస్టర్ 3 హాజరు",
            "సెమ్ 4 అటెండెన్స్", "సెమిస్టర్ 4 లో హాజరు", "సెమ్ 4 అటెండెన్స్ శాతం చూపించు", "సెమ్ 4 లో అటెండెన్స్ ఎలా ఉంది", "సెమిస్టర్ 4 హాజరు",
            "సెమ్ 5 అటెండెన్స్", "సెమిస్టర్ 5 లో హాజరు", "సెమ్ 5 అటెండెన్స్ శాతం చూపించు", "సెమ్ 5 లో అటెండెన్స్ ఎలా ఉంది", "సెమిస్టర్ 5 హాజరు",
            "సెమ్ 6 అటెండెన్స్", "సెమిస్టర్ 6 లో హాజరు", "సెమ్ 6 అటెండెన్స్ శాతం చూపించు", "సెమ్ 6 లో అటెండెన్స్ ఎలా ఉంది", "సెమిస్టర్ 6 హాజరు",
            "సెమ్ 1 అటెండెన్స్ తనిఖీ చేయండి", "సెమిస్టర్ 2 హాజరు తీసుకోండి", "నాకు సెమ్ 3 అటెండెన్స్ చూపించండి", "సెమ్ 4 అటెండెన్స్ బాగుందా", "సెమ్ 5 కోసం శాతం"
        ]
    };

    // ==================== 15. SEMESTER-WISE BACKLOG QUERIES ====================
    const semBacklogQueries = {
        en: [
            "sem 1 backlogs", "how many backlogs in sem 1", "semester 1 failed subjects", "list sem 1 backlogs", "sem 1 clear or not",
            "sem 2 backlogs", "how many backlogs in sem 2", "semester 2 failed subjects", "list sem 2 backlogs", "sem 2 clear or not",
            "sem 3 backlogs", "how many backlogs in sem 3", "semester 3 failed subjects", "list sem 3 backlogs", "sem 3 clear or not",
            "sem 4 backlogs", "how many backlogs in sem 4", "semester 4 failed subjects", "list sem 4 backlogs", "sem 4 clear or not",
            "sem 5 backlogs", "how many backlogs in sem 5", "semester 5 failed subjects", "list sem 5 backlogs", "sem 5 clear or not",
            "sem 6 backlogs", "how many backlogs in sem 6", "semester 6 failed subjects", "list sem 6 backlogs", "sem 6 clear or not",
            "check sem 1 backlogs", "any backlogs in semester 2", "failed subjects in sem 3", "sem 4 backlogs list", "is sem 5 clear"
        ],
        hi: [
            "सेम 1 बैकलॉग", "सेम 1 में कितने बैकलॉग हैं", "सेमेस्टर 1 फेल विषय", "सेम 1 बैकलॉग सूची", "सेम 1 क्लियर है या नहीं",
            "सेम 2 बैकलॉग", "सेम 2 में कितने बैकलॉग हैं", "सेमेस्टर 2 फेल विषय", "सेम 2 बैकलॉग सूची", "सेम 2 क्लियर है या नहीं",
            "सेम 3 बैकलॉग", "सेम 3 में कितने बैकलॉग हैं", "सेमेस्टर 3 फेल विषय", "सेम 3 बैकलॉग सूची", "सेम 3 क्लियर है या नहीं",
            "सेम 4 बैकलॉग", "सेम 4 में कितने बैकलॉग हैं", "सेमेस्टर 4 फेल विषय", "सेम 4 बैकलॉग सूची", "सेम 4 क्लियर है या नहीं",
            "सेम 5 बैकलॉग", "सेम 5 में कितने बैकलॉग हैं", "सेमेस्टर 5 फेल विषय", "सेम 5 बैकलॉग सूची", "सेम 5 क्लियर है या नहीं",
            "सेम 6 बैकलॉग", "सेम 6 में कितने बैकलॉग हैं", "सेमेस्टर 6 फेल विषय", "सेम 6 बैकलॉग सूची", "सेम 6 क्लियर है या नहीं",
            "सेम 1 बैकलॉग चेक करें", "क्या सेमेस्टर 2 में कोई बैकलॉग है", "सेम 3 में फेल विषय", "सेम 4 बैकलॉग सूची", "क्या सेम 5 क्लियर है"
        ],
        te: [
            "సెమ్ 1 బ్యాక్‌లాగ్‌లు", "సెమ్ 1 లో ఎన్ని బ్యాక్‌లాగ్‌లు ఉన్నాయి", "సెమిస్టర్ 1 ఫెయిల్ అయిన సబ్జెక్టులు", "సెమ్ 1 బ్యాక్‌లాగ్‌ల జాబితా", "సెమ్ 1 క్లియర్ అయిందా లేదా",
            "సెమ్ 2 బ్యాక్‌లాగ్‌లు", "సెమ్ 2 లో ఎన్ని బ్యాక్‌లాగ్‌లు ఉన్నాయి", "సెమిస్టర్ 2 ఫెయిల్ అయిన సబ్జెక్టులు", "సెమ్ 2 బ్యాక్‌లాగ్‌ల జాబితా", "సెమ్ 2 క్లియర్ అయిందా లేదా",
            "సెమ్ 3 బ్యాక్‌లాగ్‌లు", "సెమ్ 3 లో ఎన్ని బ్యాక్‌లాగ్‌లు ఉన్నాయి", "సెమిస్టర్ 3 ఫెయిల్ అయిన సబ్జెక్టులు", "సెమ్ 3 బ్యాక్‌లాగ్‌ల జాబితా", "సెమ్ 3 క్లియర్ అయిందా లేదా",
            "సెమ్ 4 బ్యాక్‌లాగ్‌లు", "సెమ్ 4 లో ఎన్ని బ్యాక్‌లాగ్‌లు ఉన్నాయి", "సెమిస్టర్ 4 ఫెయిల్ అయిన సబ్జెక్టులు", "సెమ్ 4 బ్యాక్‌లాగ్‌ల జాబితా", "సెమ్ 4 క్లియర్ అయిందా లేదా",
            "సెమ్ 5 బ్యాక్‌లాగ్‌లు", "సెమ్ 5 లో ఎన్ని బ్యాక్‌లాగ్‌లు ఉన్నాయి", "సెమిస్టర్ 5 ఫెయిల్ అయిన సబ్జెక్టులు", "సెమ్ 5 బ్యాక్‌లాగ్‌ల జాబితా", "సెమ్ 5 క్లియర్ అయిందా లేదా",
            "సెమ్ 6 బ్యాక్‌లాగ్‌లు", "సెమ్ 6 లో ఎన్ని బ్యాక్‌లాగ్‌లు ఉన్నాయి", "సెమిస్టర్ 6 ఫెయిల్ అయిన సబ్జెక్టులు", "సెమ్ 6 బ్యాక్‌లాగ్‌ల జాబితా", "సెమ్ 6 క్లియర్ అయిందా లేదా",
            "సెమ్ 1 బ్యాక్‌లాగ్స్ తనిఖీ చేయండి", "సెమిస్టర్ 2 లో ఏమైనా బ్యాక్‌లాగ్‌లు ఉన్నాయా", "సెమ్ 3 లో ఫెయిల్ అయిన సబ్జెక్టులు", "సెమ్ 4 బ్యాక్‌లాగ్ జాబితా", "సెమ్ 5 క్లియర్ అయిందా"
        ]
    };

    // ==================== 16. SEMESTER-WISE FEES QUERIES ====================
    const semFeesQueries = {
        en: [
            "sem 1 fees pending", "how much fee in semester 1", "semester 1 fee balance", "sem 1 fee status", "is sem 1 fee paid",
            "sem 1 fee due date", "sem 1 fee amount", "sem 1 fee receipt", "first semester fees",
            "sem 2 fees pending", "how much fee in semester 2", "semester 2 fee balance", "sem 2 fee status", "is sem 2 fee paid",
            "sem 2 fee due date", "sem 2 fee amount", "second semester fees",
            "sem 3 fees pending", "how much fee in semester 3", "semester 3 fee balance", "sem 3 fee status", "is sem 3 fee paid",
            "sem 3 fee due date", "sem 3 fee amount", "third semester fees",
            "sem 4 fees pending", "how much fee in semester 4", "semester 4 fee balance", "sem 4 fee status", "is sem 4 fee paid",
            "sem 4 fee due date", "sem 4 fee amount", "fourth semester fees",
            "sem 5 fees pending", "how much fee in semester 5", "semester 5 fee balance", "sem 5 fee status", "is sem 5 fee paid",
            "sem 5 fee due date", "sem 5 fee amount", "fifth semester fees",
            "sem 6 fees pending", "how much fee in semester 6", "semester 6 fee balance", "sem 6 fee status", "is sem 6 fee paid",
            "sem 6 fee due date", "sem 6 fee amount", "sixth semester fees",
            "check sem 1 fees", "any fee balance in semester 2", "how much college fee for sem 3", "sem 4 payment status", "is sem 5 dues clear",
            "sem 6 payment pending", "semester wise fee details", "fees for each semester"
        ],
        hi: [
            "सेम 1 फीस लंबित", "सेमेस्टर 1 में कितनी फीस है", "सेमेस्टर 1 फीस बकाया", "सेम 1 फीस स्थिति", "क्या सेम 1 की फीस जमा है",
            "सेम 1 फीस की अंतिम तारीख", "सेम 1 फीस राशि",
            "सेम 2 फीस लंबित", "सेमेस्टर 2 में कितनी फीस है", "सेमेस्टर 2 फीस बकाया", "सेम 2 फीस स्थिति", "क्या सेम 2 की फीस जमा है",
            "सेम 2 फीस की अंतिम तारीख", "सेम 2 फीस राशि",
            "सेम 3 फीस लंबित", "सेमेस्टर 3 में कितनी फीस है", "सेमेस्टर 3 फीस बकाया", "सेम 3 फीस स्थिति", "क्या सेम 3 की फीस जमा है",
            "सेम 3 फीस की अंतिम तारीख", "सेम 3 फीस राशि",
            "सेम 4 फीस लंबित", "सेमेस्टर 4 में कितनी फीस है", "सेमेस्टर 4 फीस बकाया", "सेम 4 फीस स्थिति", "क्या सेम 4 की फीस जमा है",
            "सेम 4 फीस की अंतिम तारीख", "सेम 4 फीस राशि",
            "सेम 5 फीस लंबित", "सेमेस्टर 5 में कितनी फीस है", "सेमेस्टर 5 फीस बकाया", "सेम 5 फीस स्थिति", "क्या सेम 5 की फीस जमा है",
            "सेम 5 फीस की अंतिम तारीख", "सेम 5 फीस राशि",
            "सेम 6 फीस लंबित", "सेमेस्टर 6 में कितनी फीस है", "सेमेस्टर 6 फीस बकाया", "सेम 6 फीस स्थिति", "क्या सेम 6 की फीस जमा है",
            "सेम 6 फीस की अंतिम तारीख", "सेम 6 फीस राशि",
            "सेम 1 फीस चेक करें", "क्या सेमेस्टर 2 में कोई फीस बाकी है", "सेम 3 के लिए कितनी कॉलेज फीस है", "सेम 4 पेमेंट स्टेटस", "क्या सेम 5 का बकाया क्लियर है",
            "सेमेस्टर वार फीस विवरण", "हर सेमेस्टर की फीस"
        ],
        te: [
            "సెమ్ 1 ఫీజు పెండింగ్", "సెమిస్టర్ 1 లో ఫీజు ఎంత", "సెమిస్టర్ 1 ఫీజు బ్యాలెన్స్", "సెమ్ 1 ఫీజు స్థితి", "సెమ్ 1 ఫీజు చెల్లించారా",
            "సెమ్ 1 ఫీజు గడువు తేదీ", "సెమ్ 1 ఫీజు మొత్తం",
            "సెమ్ 2 ఫీజు పెండింగ్", "సెమిస్టర్ 2 లో ఫీజు ఎంత", "సెమిస్టర్ 2 ఫీజు బ్యాలెన్స్", "సెమ్ 2 ఫీజు స్థితి", "సెమ్ 2 ఫీజు చెల్లించారా",
            "సెమ్ 2 ఫీజు గడువు తేదీ", "సెమ్ 2 ఫీజు మొత్తం",
            "సెమ్ 3 ఫీజు పెండింగ్", "సెమిస్టర్ 3 లో ఫీజు ఎంత", "సెమిస్టర్ 3 ఫీజు బ్యాలెన్స్", "సెమ్ 3 ఫీజు స్థితి", "సెమ్ 3 ఫీజు చెల్లించారా",
            "సెమ్ 3 ఫీజు గడువు తేదీ", "సెమ్ 3 ఫీజు మొత్తం",
            "సెమ్ 4 ఫీజు పెండింగ్", "సెమిస్టర్ 4 లో ఫీజు ఎంత", "సెమిస్టర్ 4 ఫీజు బ్యాలెన్స్", "సెమ్ 4 ఫీజు స్థితి", "సెమ్ 4 ఫీజు చెల్లించారా",
            "సెమ్ 4 ఫీజు గడువు తేదీ", "సెమ్ 4 ఫీజు మొత్తం",
            "సెమ్ 5 ఫీజు పెండింగ్", "సెమిస్టర్ 5 లో ఫీజు ఎంత", "సెమిస్టర్ 5 ఫీజు బ్యాలెన్స్", "సెమ్ 5 ఫీజు స్థితి", "సెమ్ 5 ఫీజు చెల్లించారా",
            "సెమ్ 5 ఫీజు గడువు తేదీ", "సెమ్ 5 ఫీజు మొత్తం",
            "సెమ్ 6 ఫీజు పెండింగ్", "సెమిస్టర్ 6 లో ఫీజు ఎంత", "సెమిస్టర్ 6 ఫీజు బ్యాలెన్స్", "సెమ్ 6 ఫీజు స్థితి", "సెమ్ 6 ఫీజు చెల్లించారా",
            "సెమ్ 6 ఫీజు గడువు తేదీ", "సెమ్ 6 ఫీజు మొత్తం",
            "సెమ్ 1 ఫీజు తనిఖీ చేయండి", "సెమిస్టర్ 2 లో ఏమైనా ఫీజు బ్యాలెన్స్ ఉందా", "సెమ్ 3 కోసం కాలేజీ ఫీజు ఎంత", "సెమ్ 4 పేమెంట్ స్టేటస్", "సెమ్ 5 బాకీలు క్లియర్ అయ్యాయా",
            "సెమిస్టర్ వారీ ఫీజు వివరాలు"
        ]
    };

    // ==================== 17. ADDITIONAL INTENTS ====================
    
    const navigationQueries = {
        en: [
            "how to navigate", "where is the dashboard", "dashboard", "show dashboard", "go to dashboard",
            "how to use this app", "help me navigate", "menu options"
        ],
        hi: [
            "डैशबोर्ड कहां है", "डैशबोर्ड", "कैसे नेविगेट करें", "मेनू विकल्प"
        ],
        te: [
            "ఎలా వెళ్ళాలి", "డ్యాష్‌బోర్డ్ ఎక్కడ ఉంది", "డ్యాష్‌బోర్డ్", "మెను ఎంపికలు"
        ]
    };

    const marksheetQueries = {
        en: [
            "how can I download marksheets", "download marksheet", "get marksheet PDF", "download report",
            "save marksheet", "print result"
        ],
        hi: [
            "मार्कशीट कैसे डाउनलोड करें", "मार्कशीट डाउनलोड", "रिजल्ट डाउनलोड"
        ],
        te: [
            "మార్క్ షీట్లను డౌన్‌లోడ్ చేయడం ఎలా", "మార్క్ షీట్ డౌన్‌లోడ్"
        ]
    };

    const internalMarksQueries = {
        en: [
            "m1 marks", "m2 marks", "m1", "m2", "module 1", "module 2", 
            "internal marks in chemistry", "module 1 marks in chemistry",
            "chemistry module 1 marks", "chemistry m1 marks",
            "ml m1", "ml m2", "dbms m1", "cd m1", "ai m1", "blockchain m1",
            "internal marks", "internal score", "mid marks", "module marks",
            "granular marks", "sem marks breakdown", "module 1 marks", "m1 marks list",
            "ml t1 marks", "ml t1", "t1 marks", "t2 marks", "t1", "t2", "module 1 t1"
        ],
        hi: [
            "m1 नंबर", "m2 नंबर", "m1 मार्क्स", "m2 मार्क्स", 
            "आंतरिक अंक", "इंटरनल नंबर", "मॉड्यूल मार्क्स"
        ],
        te: [
            "m1 మార్కులు", "m2 మార్కులు", "ఇంటర్నల్ మార్కులు", "మాడ్యూల్ మార్కులు"
        ]
    };

    const subjectAttendanceQueries = {
        en: [
            "is my child attending training session", "training session attendance", 
            "status of training session", "percentage in training session",
            "is he in training session", "did she attend training session",
            "attendance in training", "training attendance",
            "is my child attending training class", "training class attendance",
            "traing session", "trainig session", "tarnifing session", 
            "traing attendance", "traing class", "traning session"
        ],
        hi: [
            "क्या मेरा बच्चा ट्रेनिंग सेशन में जा रहा है", "ट्रेनिंग सेशन अटेंडेंस",
            "ट्रेनिंग सेशन की उपस्थिति", "ट्रेनिंग क्लास"
        ],
        te: [
            "నా బిడ్డ ట్రైనింగ్ సెషన్‌కు హాజరవుతున్నారా", "ట్రైనింగ్ సెషన్ హాజరు", "ట్రైనింగ్ క్లాస్"
        ]
    };

    const dateAttendanceQueries = {
        en: [
            "attendance {date}", "present {date}", "absent {date}",
            "{date} attendance", "{date} status", "{date} h1", "{date} h2",
            "{date} h3", "{date} h4", "{date} h5", "{date} h6", "{date} h7", "{date} h8",
            "h1 {date}", "h2 {date}", "h3 {date}", "h4 {date}", "h5 {date}",
            "day attendance", "date attendance", "daily log",
            "yesterday attendance", "yesterday status", "today attendance", "attendance today",
            "yesteerady she attended all classes", "yesteerady", "yestreday",
            "yesterday she attended all clases", "yesturday", "today", "yesterday",
            "was my child present on {date}?", "is he present on {date}?",
            "did my son go to college on {date}?", "was she in college on {date}",
            "on {date} my child went to college", "status for {date}",
            "tell me attendance for {date}", "presence on {date}"
        ],
        hi: [
            "{date} हाजिर", "{date} गैर-हाजिर", "{date} उपस्थिति", 
            "{date} स्टेटस", "{date} अटेंडेंस"
        ],
        te: [
            "{date} హాజరు", "{date} స్టేటస్", "{date} అటెండెన్స్"
        ]
    };

    const greetingQueries = {
        en: ["hello", "hi", "hey", "good morning", "good afternoon", "good evening", "namaste"],
        hi: ["नमस्ते", "नमस्कार", "हैलो", "सुप्रभात"],
        te: ["నమస్తే", "హలో", "శుభోదయం"]
    };

    const thanksQueries = {
        en: ["thank you", "thanks", "thank you so much", "thanks a lot", "appreciate it"],
        hi: ["धन्यवाद", "शुक्रिया", "थैंक यू"],
        te: ["ధన్యవాదాలు", "థాంక్యూ"]
    };

    // Helper to add documents
    const addCategorizedDocs = (queries, intent) => {
        ['en', 'hi', 'te'].forEach(lang => {
            if (queries[lang]) {
                queries[lang].forEach(u => manager.addDocument(lang, u, intent));
            }
        });
    };

    // Add all intents
    addCategorizedDocs(attendanceQueries, 'attendance_query');
    addCategorizedDocs(cgpaQueries, 'cgpa_query');
    addCategorizedDocs(feesQueries, 'fees_query');
    addCategorizedDocs(feesDeadlineQueries, 'fees_deadline_query');
    addCategorizedDocs(backlogsQueries, 'backlogs_query');
    addCategorizedDocs(eventsQueries, 'events_query');
    addCategorizedDocs(summaryQueries, 'summary_query');
    addCategorizedDocs(weakSubjectQueries, 'weak_subject_query');
    addCategorizedDocs(strongSubjectQueries, 'strong_subject_query');
    addCategorizedDocs(activitiesQueries, 'activities_query');
    addCategorizedDocs(achievementsQueries, 'achievements_query');
    addCategorizedDocs(studentQueries, 'student_query');
    addCategorizedDocs(contactQueries, 'contact_query');
    addCategorizedDocs(graphsQueries, 'graphs_query');
    addCategorizedDocs(semCgpaQueries, 'semester_cgpa_query');
    addCategorizedDocs(semAttendanceQueries, 'semester_attendance_query');
    addCategorizedDocs(semBacklogQueries, 'semester_backlog_query');
    addCategorizedDocs(semFeesQueries, 'semester_fees_query');
    addCategorizedDocs(navigationQueries, 'dashboard_navigation');
    addCategorizedDocs(marksheetQueries, 'marksheet_download');
    addCategorizedDocs(greetingQueries, 'greeting');
    addCategorizedDocs(thanksQueries, 'thanks_query');
    addCategorizedDocs(internalMarksQueries, 'internal_marks_query');
    addCategorizedDocs(dateAttendanceQueries, 'date_attendance_query');
    addCategorizedDocs(subjectAttendanceQueries, 'subject_attendance_query');
    addCategorizedDocs(counsellorQueries, 'counsellor_query');

    // ==================== ADD ENTITIES ====================
    manager.addRegexEntity('module', 'en', /m1|module\s*1/i);
    manager.addRegexEntity('module', 'en', /m2|module\s*2/i);
    manager.addRegexEntity('hour', 'en', /h[1-8]|(?:1st|2nd|3rd|4th|5th|6th|7th|8th)\s*(?:hour|period|class)/i);
    manager.addRegexEntity('subject', 'en', /machine learning|ml|compiler design|cd|dbms|ai|artificial intelligence|blockchain|iot|deep learning|software testing/i);

    // ==================== ADD ANSWERS FOR ALL INTENTS ====================
    
    // 1. Attendance
    manager.addAnswer('en', 'attendance_query', '📊 **Attendance Status**\n\nOverall Attendance: {attendance}%\n\nSemester-wise:\n• Sem 1: {sem1}%\n• Sem 2: {sem2}%\n• Sem 3: {sem3}%\n• Sem 4: {sem4}%\n• Sem 5: {sem5}%\n• Sem 6: {sem6}%\n\n{comment}');
    manager.addAnswer('hi', 'attendance_query', '📊 **उपस्थिति स्थिति**\n\nकुल उपस्थिति: {attendance}%\n\nसेमेस्टर-वार:\n• सेम 1: {sem1}%\n• सेम 2: {sem2}%\n• सेम 3: {sem3}%\n• सेम 4: {sem4}%\n• सेम 5: {sem5}%\n• सेम 6: {sem6}%\n\n{comment}');
    manager.addAnswer('te', 'attendance_query', '📊 **హాజరు స్థితి**\n\nమొత్తం హాజరు: {attendance}%\n\nసెమిస్టర్ వారీ:\n• సెమ్ 1: {sem1}%\n• సెమ్ 2: {sem2}%\n• సెమ్ 3: {sem3}%\n• సెమ్ 4: {sem4}%\n• సెమ్ 5: {sem5}%\n• సెమ్ 6: {sem6}%\n\n{comment}');

    // 2. CGPA
    manager.addAnswer('en', 'cgpa_query', '🎓 **Academic Performance**\n\nCurrent CGPA: {cgpa}/10\n\nSemester-wise CGPA:\n• Sem 1: {sem1_cgpa}\n• Sem 2: {sem2_cgpa}\n• Sem 3: {sem3_cgpa}\n• Sem 4: {sem4_cgpa}\n• Sem 5: {sem5_cgpa}\n• Sem 6: {sem6_cgpa}\n\n{comment}');
    manager.addAnswer('hi', 'cgpa_query', '🎓 **शैक्षणिक प्रदर्शन**\n\nवर्तमान सीजीपीए: {cgpa}/10\n\nसेमेस्टर-वार सीजीपीए:\n• सेम 1: {sem1_cgpa}\n• सेम 2: {sem2_cgpa}\n• सेम 3: {sem3_cgpa}\n• सेम 4: {sem4_cgpa}\n• सेम 5: {sem5_cgpa}\n• सेम 6: {sem6_cgpa}\n\n{comment}');
    manager.addAnswer('te', 'cgpa_query', '🎓 **అకడమిక్ పెర్ఫార్మెన్స్**\n\nప్రస్తుత CGPA: {cgpa}/10\n\nసెమిస్టర్ వారీ CGPA:\n• సెమ్ 1: {sem1_cgpa}\n• సెమ్ 2: {sem2_cgpa}\n• సెమ్ 3: {sem3_cgpa}\n• సెమ్ 4: {sem4_cgpa}\n• సెమ్ 5: {sem5_cgpa}\n• సెమ్ 6: {sem6_cgpa}\n\n{comment}');

    // 3. Fees
    manager.addAnswer('en', 'fees_query', '💰 **Fee Status Report**\n\n📊 **OVERVIEW**\n• Total Fees: ₹{total_fees}\n• Paid Amount: ₹{paid_amount}\n• Pending: **₹{pending_amount}**\n\n📅 **SEMESTER BREAKDOWN**\n• Sem 1: ₹{sem1_fee} ({sem1_status})\n• Sem 2: ₹{sem2_fee} ({sem2_status})\n• Sem 3: ₹{sem3_fee} ({sem3_status})\n• Sem 4: ₹{sem4_fee} ({sem4_status})\n• Sem 5: ₹{sem5_fee} ({sem5_status})\n• Sem 6: ₹{sem6_fee} ({sem6_status})\n\n⏰ **NEXT DUE**\n• Date: {next_due_date}\n• Amount: ₹{next_amount}\n\n💳 *Payment Options: UPI, Net Banking, Campus Counter*');
    manager.addAnswer('hi', 'fees_query', '💰 **फीस स्टेटस रिपोर्ट**\n\n📊 **सारांश**\n• कुल फीस: ₹{total_fees}\n• जमा राशि: ₹{paid_amount}\n• बकाया: **₹{pending_amount}**\n\n📅 **सेमेस्टर विवरण**\n• सेमेस्टर 1: ₹{sem1_fee} ({sem1_status})\n• सेमेस्टर 2: ₹{sem2_fee} ({sem2_status})\n• सेमेस्टर 3: ₹{sem3_fee} ({sem3_status})\n• सेमेस्टर 4: ₹{sem4_fee} ({sem4_status})\n• सेमेस्टर 5: ₹{sem5_fee} ({sem5_status})\n• सेमेस्टर 6: ₹{sem6_fee} ({sem6_status})\n\n⏰ **अगली किश्त**\n• तारीख: {next_due_date}\n• राशि: ₹{next_amount}\n\n💳 *भुगतान विकल्प: यूपीआई, नेट बैंकिंग, कैंपस काउंटर*');
    manager.addAnswer('te', 'fees_query', '💰 **ఫీజు స్టేటస్ రిపోర్ట్**\n\n📊 **సారాంశం**\n• మొత్తం ఫీజు: ₹{total_fees}\n• చెల్లించినవి: ₹{paid_amount}\n• బాకీ: **₹{pending_amount}**\n\n📅 **సెమిస్టర్ల వారీగా**\n• సెమిస్టర్ 1: ₹{sem1_fee} ({sem1_status})\n• సెమిస్టర్ 2: ₹{sem2_fee} ({sem2_status})\n• సెమిస్టర్ 3: ₹{sem3_fee} ({sem3_status})\n• సెమిస్టర్ 4: ₹{sem4_fee} ({sem4_status})\n• సెమిస్టర్ 5: ₹{sem5_fee} ({sem5_status})\n• సెమిస్టర్ 6: ₹{sem6_fee} ({sem6_status})\n\n⏰ **తదుపరి గడువు**\n• తేదీ: {next_due_date}\n• మొత్తం: ₹{next_amount}\n\n💳 *చెల్లింపు విధానం: UPI, నెట్ బ్యాంకింగ్, క్యాంపస్ కౌంటర్*');

    // 4. Fees Deadline
    manager.addAnswer('en', 'fees_deadline_query', '📅 **Fee Deadlines**\n\n• Next Due Date: {next_due_date}\n• Amount: ₹{next_amount}\n• Late Fee Applied After: {late_fee_date}\n\n💡 Tip: Pay before deadline to avoid late fees!');
    manager.addAnswer('hi', 'fees_deadline_query', '📅 **फीस की अंतिम तिथियाँ**\n\n• अगली देय तिथि: {next_due_date}\n• राशि: ₹{next_amount}\n• विलंब शुल्क प्रभावी: {late_fee_date}\n\n💡 सुझाव: विलंब शुल्क से बचने के लिए समय पर भुगतान करें!');
    manager.addAnswer('te', 'fees_deadline_query', '📅 **ఫీజు గడువు తేదీలు**\n\n• తదుపరి గడువు: {next_due_date}\n• మొత్తం: ₹{next_amount}\n• ఆలస్యం ఫీజు ప్రారంభం: {late_fee_date}\n\n💡 సూచన: ఆలస్యం ఫీజు నివారించడానికి సకాలంలో చెల్లించండి!');

    // 5. Backlogs
    manager.addAnswer('en', 'backlogs_query', '📚 **Backlog Status**\n\nTotal Backlogs: {backlog_count}\n\nFailed Subjects:\n{backlog_list}\n\n{recommendation}');
    manager.addAnswer('hi', 'backlogs_query', '📚 **बैकलॉग स्थिति**\n\nकुल बैकलॉग: {backlog_count}\n\nफेल विषय:\n{backlog_list}\n\n{recommendation}');
    manager.addAnswer('te', 'backlogs_query', '📚 **బ్యాక్‌లాగ్ స్థితి**\n\nమొత్తం బ్యాక్‌లాగ్‌లు: {backlog_count}\n\nఫెయిల్ అయిన సబ్జెక్టులు:\n{backlog_list}\n\n{recommendation}');

    // 6. Events
    manager.addAnswer('en', 'events_query', '📅 **Upcoming Events & Schedule**\n\n📝 Exams:\n{exam_schedule}\n\n🎉 Events:\n{events_list}\n\n🏖️ Holidays:\n{holiday_list}\n\n📢 Announcements: {announcements}');
    manager.addAnswer('hi', 'events_query', '📅 **आगामी कार्यक्रम और अनुसूची**\n\n📝 परीक्षाएं:\n{exam_schedule}\n\n🎉 कार्यक्रम:\n{events_list}\n\n🏖️ छुट्टियां:\n{holiday_list}\n\n📢 घोषणाएं: {announcements}');
    manager.addAnswer('te', 'events_query', '📅 **రాబోయే ఈవెంట్లు & షెడ్యూల్**\n\n📝 పరీక్షలు:\n{exam_schedule}\n\n🎉 ఈవెంట్లు:\n{events_list}\n\n🏖️ సెలవులు:\n{holiday_list}\n\n📢 ప్రకటనలు: {announcements}');

    // 7. Summary
    manager.addAnswer('en', 'summary_query', '📊 **Student Performance Summary**\n\n👤 Student: {student_name}\n📚 Branch: {branch}\n🎓 Current Semester: {semester}\n\n📈 Academics:\n• CGPA: {cgpa}/10 ({grade})\n• Attendance: {attendance}%\n• Backlogs: {backlog_count}\n\n💰 Fees Status: {fee_status}\n\n📅 Upcoming: {upcoming_event}\n\n{overall_assessment}');
    manager.addAnswer('hi', 'summary_query', '📊 **छात्र प्रदर्शन सारांश**\n\n👤 छात्र: {student_name}\n📚 शाखा: {branch}\n🎓 वर्तमान सेमेस्टर: {semester}\n\n📈 शिक्षा:\n• सीजीपीए: {cgpa}/10 ({grade})\n• उपस्थिति: {attendance}%\n• बैकलॉग: {backlog_count}\n\n💰 फीस स्थिति: {fee_status}\n\n📅 आगामी: {upcoming_event}\n\n{overall_assessment}');
    manager.addAnswer('te', 'summary_query', '📊 **విద్యార్థి ప్రదర్శన సారాంశం**\n\n👤 విద్యార్థి: {student_name}\n📚 బ్రాంచ్: {branch}\n🎓 ప్రస్తుత సెమిస్టర్: {semester}\n\n📈 అకడమిక్స్:\n• CGPA: {cgpa}/10 ({grade})\n• హాజరు: {attendance}%\n• బ్యాక్‌లాగ్‌లు: {backlog_count}\n\n💰 ఫీజు స్థితి: {fee_status}\n\n📅 రాబోయేది: {upcoming_event}\n\n{overall_assessment}');

    // 8. Weak Subjects
    manager.addAnswer('en', 'weak_subject_query', '📖 **Subjects Needing Improvement**\n\n{weak_subjects}\n\n📝 Recommendations:\n{recommendations}');
    manager.addAnswer('hi', 'weak_subject_query', '📖 **सुधार की आवश्यकता वाले विषय**\n\n{weak_subjects}\n\n📝 सुझाव:\n{recommendations}');
    manager.addAnswer('te', 'weak_subject_query', '📖 **మెరుగుదల అవసరమయ్యే సబ్జెక్టులు**\n\n{weak_subjects}\n\n📝 సిఫార్సులు:\n{recommendations}');

    // 8b. Strong Subjects
    manager.addAnswer('en', 'strong_subject_query', '🌟 **Top Performing Subjects**\n\n{strong_subjects}\n\n📈 Feedback: This shows a strong grasp of these core concepts. Maintenance of this standard is encouraged.');
    manager.addAnswer('hi', 'strong_subject_query', '🌟 **सबसे अच्छा प्रदर्शन करने वाले विषय**\n\n{strong_subjects}\n\n📈 फीडबैक: यह इन मूल अवधारणाओं की मजबूत पकड़ को दर्शाता है। इस स्तर को बनाए रखने के लिए प्रेरित करें।');
    manager.addAnswer('te', 'strong_subject_query', '🌟 **అత్యుత్తమ ప్రతిభ కనబరిచిన సబ్జెక్టులు**\n\n{strong_subjects}\n\n📈 ఫీడ్‌బ్యాక్: ఈ మౌలిక అంశాలపై మంచి పట్టు ఉందని ఇది తెలుపుతోంది. ఇదే స్థాయిని కొనసాగించడం అవసరం.');

    // 9. Activities
    manager.addAnswer('en', 'activities_query', '🎯 **Extracurricular Activities**\n\n• Sports: {sports}\n• Clubs: {clubs}\n• Cultural Activities: {cultural}\n• Volunteer Work: {volunteer}\n\n🌟 Achievements: {achievements}');
    manager.addAnswer('hi', 'activities_query', '🎯 **अतिरिक्त गतिविधियाँ**\n\n• खेल: {sports}\n• क्लब: {clubs}\n• सांस्कृतिक गतिविधियाँ: {cultural}\n• स्वयंसेवी कार्य: {volunteer}\n\n🌟 उपलब्धियाँ: {achievements}');
    manager.addAnswer('te', 'activities_query', '🎯 **అదనపు కార్యకలాపాలు**\n\n• క్రీడలు: {sports}\n• క్లబ్‌లు: {clubs}\n• సాంస్కృతిక కార్యక్రమాలు: {cultural}\n• స్వచ్ఛంద సేవ: {volunteer}\n\n🌟 విజయాలు: {achievements}');

    // 10. Achievements
    manager.addAnswer('en', 'achievements_query', '🏆 **Achievements & Certificates**\n\n🏅 Academic:\n{academic_achievements}\n\n📜 Certificates:\n{certificates}\n\n🎯 Awards:\n{awards}');
    manager.addAnswer('hi', 'achievements_query', '🏆 **उपलब्धियाँ और प्रमाणपत्र**\n\n🏅 शैक्षणिक:\n{academic_achievements}\n\n📜 प्रमाणपत्र:\n{certificates}\n\n🎯 पुरस्कार:\n{awards}');
    manager.addAnswer('te', 'achievements_query', '🏆 **విజయాలు & సర్టిఫికేట్లు**\n\n🏅 అకడమిక్:\n{academic_achievements}\n\n📜 సర్టిఫికేట్లు:\n{certificates}\n\n🎯 అవార్డులు:\n{awards}');

    // 11. Student Query
    manager.addAnswer('en', 'student_query', '👤 **Student Profile**\n\nName: {name}\nRoll Number: {roll_number}\nRegistration No: {reg_number}\nBranch: {branch}\nCurrent Semester: {semester}\nYear: {year}\nEmail: {email}\nContact: {contact}');
    manager.addAnswer('hi', 'student_query', '👤 **छात्र प्रोफाइल**\n\nनाम: {name}\nरोल नंबर: {roll_number}\nपंजीकरण संख्या: {reg_number}\nशाखा: {branch}\nवर्तमान सेमेस्टर: {semester}\nवर्ष: {year}\nईमेल: {email}\nसंपर्क: {contact}');
    manager.addAnswer('te', 'student_query', '👤 **విద్యార్థి ప్రొఫైల్**\n\nపేరు: {name}\nరోల్ నంబర్: {roll_number}\nరిజిస్ట్రేషన్ నంబర్: {reg_number}\nబ్రాంచ్: {branch}\nప్రస్తుత సెమిస్టర్: {semester}\nసంవత్సరం: {year}\nఇమెయిల్: {email}\nసంప్రదింపు: {contact}');

    // 11b. Contacts
    manager.addAnswer('en', 'contact_query', '📞 **Quick Contacts**\n\n**Class Advisor:**\n• Name: {advisor_name}\n• Email: {advisor_email}\n• Phone: {advisor_phone}\n\n**Other Contacts:**\n{faculty_contact}');
    manager.addAnswer('hi', 'contact_query', '📞 **त्वरित संपर्क**\n\n**क्लास एडवाइजर:**\n• नाम: {advisor_name}\n• ईमेल: {advisor_email}\n• फोन: {advisor_phone}\n\n**अन्य संपर्क:**\n{faculty_contact}');
    manager.addAnswer('te', 'contact_query', '📞 **త్వరిత సంప్రదింపులు**\n\n**క్లాస్ అడ్వైజర్:**\n• పేరు: {advisor_name}\n• ఈమెయిల్: {advisor_email}\n• ఫోన్: {advisor_phone}\n\n**ఇతర సంప్రదింపులు:**\n{faculty_contact}');

    manager.addAnswer('en', 'counsellor_query', '🤝 **Student Counselling Support**\n\nWe provide professional counselling services for student well-being. You can contact our counsellor directly:\n\n👤 **Counsellor:** Dr. Emily Watson\n📞 **Phone:** **+1 (555) 234-5678**\n✉️ **Email:** e.watson@university.edu\n\nYou can also find these details in the **Quick Contacts** section of your Dashboard.');
    manager.addAnswer('hi', 'counsellor_query', '🤝 **छात्र परामर्श सहायता**\n\nहम छात्र कल्याण के लिए पेशेवर परामर्श सेवाएं प्रदान करते हैं। आप सीधे हमारे काउंसलर से संपर्क कर सकते हैं:\n\n👤 **काउंसलर:** डॉ. एमिली वाटसन\n📞 **फोन:** **+1 (555) 234-5678**\n✉️ **ईमेल:** e.watson@university.edu\n\nआप ये विवरण अपने डैशबोर्ड के **Quick Contacts** अनुभाग में भी पा सकते हैं।');
    manager.addAnswer('te', 'counsellor_query', '🤝 **విద్యార్థి కౌన్సెలింగ్ సపోర్ట్**\n\nమేము విద్యార్థుల సంక్షేమం కోసం వృత్తిపరమైన కౌన్సెలింగ్ సేవలను అందిస్తాము. మీరు మా కౌన్సెలర్‌ను నేరుగా సంప్రదించవచ్చు:\n\n👤 **కౌన్సిలర్:** డాక్టర్ ఎమిలీ వాట్సన్\n📞 **ఫోన్:** **+1 (555) 234-5678**\n✉️ **ఈమెయిల్:** e.watson@university.edu\n\nమీరు ఈ వివరాలను మీ డ్యాష్‌బోర్డ్‌లోని **Quick Contacts** విభాగంలో కూడా చూడవచ్చు.');

    // 12. Graphs
    manager.addAnswer('en', 'graphs_query', '📊 **Visual Analytics**\n\nYou can view the following charts in the Dashboard:\n• CGPA Trend Chart (Sem 1-6)\n• Attendance Percentage Graph\n• Subject-wise Performance\n• Fee Payment Timeline\n\nNavigate to Dashboard → Analytics section to view all graphs.');
    manager.addAnswer('hi', 'graphs_query', '📊 **विजुअल एनालिटिक्स**\n\nआप डैशबोर्ड में निम्न चार्ट देख सकते हैं:\n• सीजीपीए ट्रेंड चार्ट (सेम 1-6)\n• उपस्थिति प्रतिशत ग्राफ\n• विषय-वार प्रदर्शन\n• फीस भुगतान टाइमलाइन\n\nसभी ग्राफ देखने के लिए डैशबोर्ड → एनालिटिक्स सेक्शन पर जाएं।');
    manager.addAnswer('te', 'graphs_query', '📊 **విజువల్ అనలిటిక్స్**\n\nమీరు డ్యాష్‌బోర్డ్‌లో ఈ క్రింది చార్ట్‌లను చూడవచ్చు:\n• CGPA ట్రెండ్ చార్ట్ (సెమ్ 1-6)\n• హాజరు శాతం గ్రాఫ్\n• సబ్జెక్ట్ వారీ పెర్ఫార్మెన్స్\n• ఫీజు చెల్లింపు టైమ్‌లైన్\n\nఅన్ని గ్రాఫ్‌లను చూడటానికి డ్యాష్‌బోర్డ్ → అనలిటిక్స్ విభాగానికి నావిగేట్ చేయండి.');

    // 13. Semester CGPA
    manager.addAnswer('en', 'semester_cgpa_query', '📚 **Semester {semester} CGPA: {cgpa}/10**\n\n{performance_comment}\n\n📊 Subject-wise Breakdown:\n{subject_marks}');
    manager.addAnswer('hi', 'semester_cgpa_query', '📚 **सेमेस्टर {semester} सीजीपीए: {cgpa}/10**\n\n{performance_comment}\n\n📊 विषय-वार विवरण:\n{subject_marks}');
    manager.addAnswer('te', 'semester_cgpa_query', '📚 **సెమిస్టర్ {semester} CGPA: {cgpa}/10**\n\n{performance_comment}\n\n📊 సబ్జెక్ట్ వారీ వివరాలు:\n{subject_marks}');

    // 14. Semester Attendance
    manager.addAnswer('en', 'semester_attendance_query', '📊 **Semester {semester} Attendance: {attendance}%**\n\n📅 Total Classes: {total_classes}\n✅ Present: {present}\n❌ Absent: {absent}\n\n{comment}');
    manager.addAnswer('hi', 'semester_attendance_query', '📊 **सेमेस्टर {semester} उपस्थिति: {attendance}%**\n\n📅 कुल कक्षाएं: {total_classes}\n✅ उपस्थित: {present}\n❌ अनुपस्थित: {absent}\n\n{comment}');
    manager.addAnswer('te', 'semester_attendance_query', '📊 **సెమిస్టర్ {semester} హాజరు: {attendance}%**\n\n📅 మొత్తం తరగతులు: {total_classes}\n✅ హాజరు: {present}\n❌ గైర్హాజరు: {absent}\n\n{comment}');

    // 15. Semester Backlogs
    manager.addAnswer('en', 'semester_backlog_query', '📚 **Semester {semester} Backlogs: {backlog_count}**\n\n❌ Failed Subjects:\n{backlog_list}\n\n📝 Re-exam Date: {reexam_date}\n\n{recommendation}');
    manager.addAnswer('hi', 'semester_backlog_query', '📚 **सेमेस्टर {semester} बैकलॉग: {backlog_count}**\n\n❌ फेल विषय:\n{backlog_list}\n\n📝 पुनः परीक्षा तिथि: {reexam_date}\n\n{recommendation}');
    manager.addAnswer('te', 'semester_backlog_query', '📚 **సెమిస్టర్ {semester} బ్యాక్‌లాగ్‌లు: {backlog_count}**\n\n❌ ఫెయిల్ అయిన సబ్జెక్టులు:\n{backlog_list}\n\n📝 మళ్లీ పరీక్ష తేదీ: {reexam_date}\n\n{recommendation}');

    // 16. Semester Fees
    manager.addAnswer('en', 'semester_fees_query', '💰 **Semester {semester} Fee Details**\n\n📋 Fee Breakdown:\n• Tuition: ₹{tuition}\n• Development: ₹{development}\n• Exam: ₹{exam}\n• Library: ₹{library}\n• Total: ₹{total}\n\n✅ Payment Status: {status}\n📅 Due Date: {due_date}\n🧾 Receipt No: {receipt_no}\n\n{payment_action}');
    manager.addAnswer('hi', 'semester_fees_query', '💰 **सेमेस्टर {semester} फीस विवरण**\n\n📋 फीस का विवरण:\n• ट्यूशन: ₹{tuition}\n• विकास: ₹{development}\n• परीक्षा: ₹{exam}\n• पुस्तकालय: ₹{library}\n• कुल: ₹{total}\n\n✅ भुगतान स्थिति: {status}\n📅 देय तिथि: {due_date}\n🧾 रसीद संख्या: {receipt_no}\n\n{payment_action}');
    manager.addAnswer('te', 'semester_fees_query', '💰 **సెమిస్టర్ {semester} ఫీజు వివరాలు**\n\n📋 ఫీజు వివరాలు:\n• ట్యూషన్: ₹{tuition}\n• అభివృద్ధి: ₹{development}\n• పరీక్ష: ₹{exam}\n• లైబ్రరీ: ₹{library}\n• మొత్తం: ₹{total}\n\n✅ చెల్లింపు స్థితి: {status}\n📅 గడువు తేదీ: {due_date}\n🧾 రసీదు నంబర్: {receipt_no}\n\n{payment_action}');

    // 17. Navigation & Download
    manager.addAnswer('en', 'dashboard_navigation', '📱 **Dashboard Navigation**\n\nMain Sections:\n• Overview - View student summary\n• Attendance - Track attendance\n• Performance - CGPA and marks\n• Backlogs - Failed subjects\n• Fee Status - Payment details\n• Updates - News & events\n• AI Assistant - 24/7 support\n\nSelect any section from the sidebar to view details.');
    manager.addAnswer('en', 'marksheet_download', '📄 **Download Marksheet**\n\nTo download marksheet:\n1. Go to Dashboard\n2. Select "Performance" section\n3. Click on "Download PDF" button\n4. Select semester\n5. Save the file\n\nAlternatively, you can request the admin for official transcripts.');
    manager.addAnswer('en', 'greeting', '👋 Hello! I am your Academic Assistant. I can help you with:\n• Attendance tracking\n• CGPA & performance\n• Fee status & deadlines\n• Backlog information\n• Exam schedules\n• Student profile\n\nHow can I help you today?');
    manager.addAnswer('en', 'thanks_query', '😊 You\'re welcome! Feel free to ask if you need any more help. Have a great day!');

    // Internal Marks and Date Attendance are handled by the Smart AI fallback in server.js

    // Hindi Answers
    manager.addAnswer('hi', 'dashboard_navigation', '📱 **डैशबोर्ड नेविगेशन**\n\nमुख्य अनुभाग:\n• अवलोकन - छात्र सारांश देखें\n• उपस्थिति - उपस्थिति ट्रैक करें\n• प्रदर्शन - सीजीपीए और अंक\n• बैकलॉग - फेल विषय\n• फीस स्थिति - भुगतान विवरण\n• अपडेट्स - समाचार और कार्यक्रम\n• एआई सहायक - 24/7 सहायता\n\nविवरण देखने के लिए साइडबार से कोई भी अनुभाग चुनें।');
    manager.addAnswer('hi', 'marksheet_download', '📄 **मार्कशीट डाउनलोड**\n\nमार्कशीट डाउनलोड करने के लिए:\n1. डैशबोर्ड पर जाएं\n2. "प्रदर्शन" सेक्शन चुनें\n3. "डाउनलोड पीडीएफ" बटन पर क्लिक करें\n4. सेमेस्टर चुनें\n5. फाइल सेव करें\n\nआधिकारिक ट्रांसक्रिप्ट के लिए प्रशासन से संपर्क कर सकते हैं।');
    manager.addAnswer('hi', 'greeting', '👋 नमस्ते! मैं आपका शैक्षणिक सहायक हूं। मैं आपकी मदद कर सकता हूं:\n• उपस्थिति ट्रैकिंग\n• सीजीपीए और प्रदर्शन\n• फीस स्थिति और तिथियां\n• बैकलॉग जानकारी\n• परीक्षा कार्यक्रम\n• छात्र प्रोफाइल\n\nआज मैं आपकी क्या सहायता कर सकता हूं?');
    manager.addAnswer('hi', 'thanks_query', '😊 आपका स्वागत है! यदि और कोई सहायता चाहिए तो कृपया पूछें। आपका दिन शुभ हो!');

    // Telugu Answers
    manager.addAnswer('te', 'dashboard_navigation', '📱 **డ్యాష్‌బోర్డ్ నావిగేషన్**\n\nప్రధాన విభాగాలు:\n• అవలోకనం - విద్యార్థి సారాంశం చూడండి\n• హాజరు - హాజరు ట్రాక్ చేయండి\n• ప్రదర్శన - సిజిపిఎ మరియు మార్కులు\n• బ్యాక్‌లాగ్‌లు - ఫెయిల్ అయిన సబ్జెక్టులు\n• ఫీజు స్థితి - చెల్లింపు వివరాలు\n• అప్‌డేట్స్ - వార్తలు & ఈవెంట్లు\n• ఏఐ అసిస్టెంట్ - 24/7 సహాయం\n\nవివరాలను చూడటానికి సైడ్‌బార్ నుండి ఏదైనా విభాగాన్ని ఎంచుకోండి.');
    manager.addAnswer('te', 'marksheet_download', '📄 **మార్క్ షీట్ డౌన్‌లోడ్**\n\nమార్క్ షీట్ డౌన్‌లోడ్ చేయడానికి:\n1. డ్యాష్‌బోర్డ్‌కు వెళ్లండి\n2. "ప్రదర్శన" విభాగాన్ని ఎంచుకోండి\n3. "PDF డౌన్‌లోడ్" బటన్‌పై క్లిక్ చేయండి\n4. సెమిస్టర్ ఎంచుకోండి\n5. ఫైల్ సేవ్ చేయండి\n\nఅధికారిక ట్రాన్స్‌క్రిప్ట్‌ల కోసం అడ్మిన్‌ను సంప్రదించండి.');
    manager.addAnswer('te', 'greeting', '👋 నమస్తే! నేను మీ అకడమిక్ అసిస్టెంట్‌ని. నేను మీకు సహాయపడగలను:\n• హాజరు ట్రాకింగ్\n• సిజిపిఎ & ప్రదర్శన\n• ఫీజు స్థితి & గడువులు\n• బ్యాక్‌లాగ్ సమాచారం\n• పరీక్ష షెడ్యూల్\n• విద్యార్థి ప్రొఫైల్\n\nఈ రోజు నేను మీకు ఎలా సహాయపడగలను?');
    manager.addAnswer('te', 'thanks_query', '😊 మీకు స్వాగతం! మీకు ఇంకా ఏదైనా సహాయం కావాలంటే అడగండి. మీ రోజు శుభంగా ఉండాలి!');

    console.log('--- Comprehensive Parent Academic Monitoring NLP Training Started ---');
    console.log('Intents included: attendance, cgpa, fees, fees_deadline, backlogs, events, summary, weak_subject, activities, achievements, student, graphs, semester_cgpa, semester_attendance, semester_backlog, semester_fees, navigation, marksheet, greeting, thanks');
    console.log('Languages: English, Hindi, Telugu');
    console.log('Key improvements: Added GPA variations, fixed typos (same→sem), enhanced fee queries with payment history and deadlines');
    
    await manager.train();
    await manager.save('model.nlp');
    console.log('--- NLP Model Successfully Saved (model.nlp) ---');
}

trainNLP().catch(console.error);