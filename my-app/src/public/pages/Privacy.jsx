import { useTranslation } from "react-i18next";
import { ShieldCheck } from "lucide-react";

// Public privacy policy. Meta requires a publicly reachable privacy-policy URL
// before a WhatsApp app can be published (Development → Live), so this page is
// intentionally OUTSIDE any auth guard. Content is kept here rather than in the
// shared locale files to avoid bloating them with long legal copy.
const CONTENT = {
  en: {
    title: "Privacy Policy",
    updated: "Last updated: 17 July 2026",
    intro:
      "Shoplix (“we”, “us”) operates this online store. This policy explains what personal data we collect, why we collect it, who we share it with, and the rights you have over it.",
    sections: [
      {
        h: "Information we collect",
        items: [
          "Account details: your first and last name, your mobile phone number, and your password — stored only as a secure one-way hash. We never store your actual password.",
          "Order details: the products you order, your delivery region, city and address, and your order history.",
          "WhatsApp messages: if you message our business number, we process the content of that message to verify your number or to answer your product questions.",
          "Technical data: a secure, http-only session cookie that keeps you signed in.",
        ],
      },
      {
        h: "How we use your information",
        items: [
          "To create and secure your account, and to verify that the phone number you gave us belongs to you.",
          "To process and deliver your orders, and to calculate the delivery fee for your region.",
          "To send you updates about your orders.",
          "To answer your product questions through our WhatsApp assistant.",
        ],
        note: "We do not sell your personal data, and we do not use it for advertising profiles.",
      },
      {
        h: "WhatsApp",
        items: [
          "We use the WhatsApp Business Platform, provided by Meta, to verify your phone number when you sign up and to send order updates or answer questions.",
          "When you send a message to our WhatsApp business number, Meta processes that message and delivers it to us. Your use of WhatsApp is also governed by WhatsApp’s own privacy policy.",
          "Voice notes sent to our WhatsApp number may be converted to text so our assistant can understand your request.",
        ],
      },
      {
        h: "Service providers",
        items: [
          "Meta Platforms (WhatsApp Business Platform) — messaging and phone verification.",
          "MongoDB Atlas — database hosting.",
          "Render and Vercel — application hosting.",
          "Cloudinary — image hosting.",
          "Groq — speech-to-text for WhatsApp voice notes.",
        ],
        note: "These providers process your data only on our instructions.",
      },
      {
        h: "Data retention",
        items: [
          "Account and order data is kept for as long as your account is active.",
          "Phone-verification codes are deleted automatically within 15 minutes.",
        ],
      },
      {
        h: "Your rights",
        items: [
          "You can view and update your name and phone number, and change your password, from your account settings at any time.",
          "To request a copy of your data, or to ask us to delete your account, contact us using the details below.",
        ],
      },
      {
        h: "Cookies",
        items: [
          "We use one essential cookie to keep you signed in. We do not use advertising or tracking cookies.",
        ],
      },
      {
        h: "Contact us",
        items: ["WhatsApp: +972 59-380-8251", "Email: support@shoplix.com"],
      },
    ],
  },

  ar: {
    title: "سياسة الخصوصية",
    updated: "آخر تحديث: 17 تموز 2026",
    intro:
      "تُشغّل «شوبليكس» هذا المتجر الإلكتروني. توضّح هذه السياسة البيانات الشخصية التي نجمعها، وسبب جمعها، ومع من نشاركها، وحقوقك تجاهها.",
    sections: [
      {
        h: "البيانات التي نجمعها",
        items: [
          "بيانات الحساب: اسمك الأول واسم العائلة، ورقم هاتفك المحمول، وكلمة المرور — تُخزَّن فقط كبصمة تشفير أحادية الاتجاه. لا نخزّن كلمة مرورك الفعلية أبداً.",
          "بيانات الطلب: المنتجات التي تطلبها، ومنطقة التوصيل والمدينة والعنوان، وسجل طلباتك.",
          "رسائل واتساب: عند مراسلتك رقم عملنا، نعالج محتوى الرسالة للتحقق من رقمك أو للإجابة عن أسئلتك حول المنتجات.",
          "بيانات تقنية: ملف تعريف ارتباط آمن (http-only) يبقيك مسجّل الدخول.",
        ],
      },
      {
        h: "كيف نستخدم بياناتك",
        items: [
          "لإنشاء حسابك وتأمينه، وللتحقق من أن رقم الهاتف الذي زوّدتنا به يخصّك.",
          "لمعالجة طلباتك وتوصيلها، ولحساب رسوم التوصيل حسب منطقتك.",
          "لإرسال تحديثات حول طلباتك.",
          "للإجابة عن أسئلتك حول المنتجات عبر مساعدنا على واتساب.",
        ],
        note: "نحن لا نبيع بياناتك الشخصية، ولا نستخدمها لأغراض الملفات الإعلانية.",
      },
      {
        h: "واتساب",
        items: [
          "نستخدم منصة واتساب للأعمال المقدَّمة من «ميتا» للتحقق من رقم هاتفك عند التسجيل، ولإرسال تحديثات الطلبات أو الإجابة عن الأسئلة.",
          "عند إرسالك رسالة إلى رقم عملنا على واتساب، تعالج «ميتا» تلك الرسالة وتسلّمها إلينا. يخضع استخدامك لواتساب أيضاً لسياسة خصوصية واتساب نفسها.",
          "قد تُحوَّل الرسائل الصوتية المُرسَلة إلى رقمنا إلى نص ليتمكّن مساعدنا من فهم طلبك.",
        ],
      },
      {
        h: "مزوّدو الخدمة",
        items: [
          "ميتا (منصة واتساب للأعمال) — المراسلة والتحقق من الهاتف.",
          "MongoDB Atlas — استضافة قاعدة البيانات.",
          "Render وVercel — استضافة التطبيق.",
          "Cloudinary — استضافة الصور.",
          "Groq — تحويل الصوت إلى نص للرسائل الصوتية على واتساب.",
        ],
        note: "يعالج هؤلاء المزوّدون بياناتك وفق تعليماتنا فقط.",
      },
      {
        h: "مدة الاحتفاظ بالبيانات",
        items: [
          "يُحتفَظ ببيانات الحساب والطلبات طالما بقي حسابك نشطاً.",
          "تُحذف رموز التحقق من الهاتف تلقائياً خلال 15 دقيقة.",
        ],
      },
      {
        h: "حقوقك",
        items: [
          "يمكنك عرض وتعديل اسمك ورقم هاتفك، وتغيير كلمة المرور، من إعدادات حسابك في أي وقت.",
          "لطلب نسخة من بياناتك أو حذف حسابك، تواصل معنا عبر التفاصيل أدناه.",
        ],
      },
      {
        h: "ملفات تعريف الارتباط",
        items: [
          "نستخدم ملف تعريف ارتباط أساسياً واحداً لإبقائك مسجّل الدخول. لا نستخدم ملفات تتبّع أو إعلانات.",
        ],
      },
      {
        h: "تواصل معنا",
        items: ["واتساب: ‎+972 59-380-8251", "البريد الإلكتروني: support@shoplix.com"],
      },
    ],
  },

  he: {
    title: "מדיניות פרטיות",
    updated: "עודכן לאחרונה: 17 ביולי 2026",
    intro:
      "‏Shoplix מפעילה את החנות המקוונת הזו. מדיניות זו מסבירה אילו נתונים אישיים אנו אוספים, מדוע, עם מי אנו משתפים אותם, ומהן הזכויות שלכם.",
    sections: [
      {
        h: "מידע שאנו אוספים",
        items: [
          "פרטי חשבון: שם פרטי ושם משפחה, מספר טלפון נייד, וסיסמה — הנשמרת רק כגיבוב חד-כיווני מאובטח. איננו שומרים את הסיסמה עצמה.",
          "פרטי הזמנה: המוצרים שהזמנתם, אזור המשלוח, העיר והכתובת, והיסטוריית ההזמנות שלכם.",
          "הודעות וואטסאפ: אם תשלחו הודעה למספר העסקי שלנו, אנו מעבדים את תוכן ההודעה כדי לאמת את מספרכם או לענות על שאלות לגבי מוצרים.",
          "נתונים טכניים: עוגייה מאובטחת (http-only) ששומרת אתכם מחוברים.",
        ],
      },
      {
        h: "כיצד אנו משתמשים במידע",
        items: [
          "כדי ליצור ולאבטח את חשבונכם, ולוודא שמספר הטלפון שמסרתם שייך לכם.",
          "כדי לעבד ולספק את ההזמנות שלכם, ולחשב את דמי המשלוח לאזורכם.",
          "כדי לשלוח לכם עדכונים על ההזמנות.",
          "כדי לענות על שאלות לגבי מוצרים באמצעות העוזר שלנו בוואטסאפ.",
        ],
        note: "איננו מוכרים את הנתונים האישיים שלכם ואיננו משתמשים בהם לפרופילים פרסומיים.",
      },
      {
        h: "וואטסאפ",
        items: [
          "אנו משתמשים בפלטפורמת וואטסאפ העסקית של Meta כדי לאמת את מספר הטלפון שלכם בהרשמה ולשלוח עדכוני הזמנות או לענות על שאלות.",
          "כאשר אתם שולחים הודעה למספר העסקי שלנו, Meta מעבדת את ההודעה ומעבירה אותה אלינו. השימוש שלכם בוואטסאפ כפוף גם למדיניות הפרטיות של וואטסאפ.",
          "הודעות קוליות שנשלחות למספר שלנו עשויות להיות מומרות לטקסט כדי שהעוזר שלנו יוכל להבין את בקשתכם.",
        ],
      },
      {
        h: "ספקי שירות",
        items: [
          "‏Meta Platforms (פלטפורמת וואטסאפ העסקית) — הודעות ואימות טלפון.",
          "‏MongoDB Atlas — אחסון מסד נתונים.",
          "‏Render ו-Vercel — אחסון האפליקציה.",
          "‏Cloudinary — אחסון תמונות.",
          "‏Groq — המרת דיבור לטקסט להודעות קוליות בוואטסאפ.",
        ],
        note: "ספקים אלה מעבדים את הנתונים שלכם רק לפי הוראותינו.",
      },
      {
        h: "שמירת נתונים",
        items: [
          "נתוני חשבון והזמנות נשמרים כל עוד החשבון שלכם פעיל.",
          "קודי אימות טלפון נמחקים אוטומטית תוך 15 דקות.",
        ],
      },
      {
        h: "הזכויות שלכם",
        items: [
          "תוכלו לצפות ולעדכן את שמכם ומספר הטלפון, ולשנות סיסמה, מהגדרות החשבון בכל עת.",
          "לבקשת עותק של הנתונים שלכם או מחיקת החשבון, צרו קשר בפרטים שלהלן.",
        ],
      },
      {
        h: "עוגיות",
        items: [
          "אנו משתמשים בעוגייה חיונית אחת כדי לשמור אתכם מחוברים. איננו משתמשים בעוגיות פרסום או מעקב.",
        ],
      },
      {
        h: "צור קשר",
        items: ["וואטסאפ: ‎+972 59-380-8251", "אימייל: support@shoplix.com"],
      },
    ],
  },
};

export default function Privacy() {
  const { i18n } = useTranslation();
  const lang = ["en", "ar", "he"].includes(i18n.language) ? i18n.language : "en";
  const c = CONTENT[lang];

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-50">
          <ShieldCheck className="h-6 w-6 text-green-600" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">{c.title}</h1>
          <p className="text-sm text-gray-500">{c.updated}</p>
        </div>
      </div>

      <p className="mb-10 leading-relaxed text-gray-600">{c.intro}</p>

      <div className="space-y-8">
        {c.sections.map((s) => (
          <section key={s.h}>
            <h2 className="mb-3 text-lg font-bold text-gray-900">{s.h}</h2>
            <ul className="space-y-2">
              {s.items.map((item) => (
                <li key={item} className="flex gap-3 text-sm leading-relaxed text-gray-600">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-green-500" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            {s.note && (
              <p className="mt-3 rounded-xl bg-gray-50 p-3 text-sm font-medium text-gray-700">
                {s.note}
              </p>
            )}
          </section>
        ))}
      </div>
    </div>
  );
}
