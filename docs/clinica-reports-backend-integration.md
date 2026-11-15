# Clinica Reports --- Backend Integration Guide

> **الغرض:** توثيق ربط شاشة التقارير (Reports) مع الـ Backend اعتمادًا
> على Postman Collection، مع الحفاظ على الـ existing design system والـ
> patterns المستخدمة بالفعل في المشروع.
>
> **نطاق التوثيق:** هذا الملف يغطي مجلد `reports` فقط. أسماء الـ
> endpoints والـ query parameters مأخوذة من الـ Collection. أي تفاصيل
> غير موجودة فيها --- خصوصًا response schemas --- موضحة صراحةً باعتبارها
> نقاطًا تحتاج تأكيدًا من الباك إند.

------------------------------------------------------------------------

## 1. نظرة عامة

الـ Collection تحتوي على 3 تقارير:

  ------------------------------------------------------------------------------------
  التقرير                 Endpoint                             الوظيفة
  ----------------------- ------------------------------------ -----------------------
  Appointments            `GET /api/v1/reports/appointments`   تقرير المواعيد مع
                                                               إمكانية الفلترة

  Invoices                `GET /api/v1/reports/invoice`        تقرير الفواتير مع
                                                               إمكانية الفلترة

  Patients                `GET /api/v1/reports/patient`        تقرير المرضى خلال فترة
                                                               زمنية
  ------------------------------------------------------------------------------------

كل الطلبات الثلاثة تستخدم **Bearer Token**، ولا توجد في الـ Collection
أي endpoints لإنشاء أو تعديل أو حذف التقارير. بالتالي شاشة Reports في
الـ Frontend شاشة قراءة وفلترة للبيانات (Read-only).

### Base URL

استخدم نفس `baseURL` المركزي الموجود في المشروع، ولا تكتب رابط السيرفر
داخل كل service.

``` env
VITE_API_URL=your_backend_base_url
```

> اسم متغير البيئة هنا مثال فقط. احتفظ بالاسم والإعدادات الفعلية
> المستخدمة في المشروع.

### Authentication

أرسل access token الحالي من نظام المصادقة الموجود بالفعل:

``` http
Authorization: Bearer <user_token>
```

لا تخزن token خاصًا بالتقارير، ولا تنشئ Axios instance جديدًا إذا كان
المشروع لديه instance مركزي يضيف الـ token ويتعامل مع انتهاء الجلسة.

------------------------------------------------------------------------

## 2. Appointments Report

### Endpoint

``` http
GET /api/v1/reports/appointments
```

### Query Parameters

  Parameter     النوع         مثال                         ملاحظات
  ------------- ------------- ---------------------------- --------------
  `status`      string        `pending`                    حالة الموعد
  `type`        string        `consultation`               نوع الموعد
  `doctor`      string (ID)   `6aa590567ea21f2e8355418a`   معرف الطبيب
  `startDate`   date          `2026-10-18`                 بداية الفترة
  `endDate`     date          `2026-10-18`                 نهاية الفترة

الـ Collection أرسلت الطلب التالي:

``` http
GET /api/v1/reports/appointments?status=pending&type=consultation&startDate=2026-10-18&endDate=2026-10-18
```

يوجد أيضًا parameter باسم `doctor` في إعدادات Postman لكنه **Disabled**
في المثال؛ هذا يشير إلى أنه فلتر متاح أو مُجهّز للاستخدام، لكنه لم يُرسل في
الطلب المحفوظ. يلزم اختباره مع الباك إند قبل الاعتماد النهائي عليه.

### ربط الفلاتر بالواجهة

-   Status: قائمة بالحالات التي يدعمها النظام. المثال يؤكد `pending`
    فقط؛ راجع قيم الحالات الفعلية في المشروع والباك.
-   Type: قائمة بأنواع المواعيد. المثال يؤكد `consultation` فقط؛ لا
    تفترض أن هذه هي القيمة الوحيدة.
-   Doctor: استخدم قائمة الأطباء الموجودة بالفعل في المشروع، وأرسل
    `doctor._id` وليس اسم الطبيب.
-   Date range: أرسل `startDate` و`endDate` بصيغة `YYYY-MM-DD`.

**مهم:** لا تفترض أسماء أو قيمًا إضافية للحالات والأنواع من المثال وحده.

### مثال Request

``` http
GET {{base_url}}/api/v1/reports/appointments?status=pending&type=consultation&doctor=<doctorId>&startDate=2026-10-01&endDate=2026-10-31
```

احذف أي query parameter غير محدد بدلًا من إرساله بقيمة `undefined` أو
`null` أو string فارغ.

------------------------------------------------------------------------

## 3. Invoices Report

### Endpoint

``` http
GET /api/v1/reports/invoice
```

### Query Parameters

  Parameter         النوع         مثال                         ملاحظات
  ----------------- ------------- ---------------------------- ---------------
  `status`          string        `paid`                       حالة الفاتورة
  `paymentMethod`   string        `cash`                       طريقة الدفع
  `startDate`       date          `2026-10-18`                 بداية الفترة
  `endDate`         date          `2026-10-18`                 نهاية الفترة
  `doctor`          string (ID)   `6abf9815e74ce74e99f463e6`   معرف الطبيب

الـ Collection أرسلت:

``` http
GET /api/v1/reports/invoice/?status=paid&paymentMethod=cash&startDate=2026-10-18&endDate=2026-10-18&doctor=6abf9815e74ce74e99f463e6
```

### ملاحظات مهمة

1.  استخدم المسار الأساسي `/reports/invoice`، ولا تضف slash أو segment
    فارغًا بعد `invoice`. Postman يعرض `/invoice/` بسبب وجود عنصر path
    فارغ في تعريف الطلب؛ لا يوجد ما يثبت أن هذا الجزء مطلوب.
2.  `status` و`paymentMethod` و`doctor` فلاتر مستقلة حسب المثال.
3.  قيم الحالات وطرق الدفع المتاحة بالكامل غير موثقة في الـ Collection.
    المثال يثبت فقط `paid` و`cash`.
4.  لا تحسب إجمالي الإيرادات أو المبالغ المدفوعة من بيانات غير مؤكدة.
    اعتمد على حقول الاستجابة بعد فحصها، وحدد مع الباك هل الإجماليات
    محسوبة على مستوى السيرفر أم ستُحسب من السجلات.

### مثال Request

``` http
GET {{base_url}}/api/v1/reports/invoice?status=paid&paymentMethod=cash&startDate=2026-10-01&endDate=2026-10-31&doctor=<doctorId>
```

------------------------------------------------------------------------

## 4. Patients Report

### Endpoint

``` http
GET /api/v1/reports/patient
```

### Query Parameters

  Parameter     النوع   مثال           ملاحظات
  ------------- ------- -------------- --------------
  `startDate`   date    `2026-10-18`   بداية الفترة
  `endDate`     date    `2026-10-18`   نهاية الفترة

الـ Collection لا تعرض أي فلاتر أخرى لتقرير المرضى.

### مثال Request

``` http
GET {{base_url}}/api/v1/reports/patient?startDate=2026-10-01&endDate=2026-10-31
```

**نقطة تحتاج تأكيدًا:** هل التقرير يعرض المرضى الذين تم إنشاؤهم خلال
الفترة، أم المرضى الذين لديهم نشاط/زيارات خلالها، أم إحصائيات أخرى؟ اسم
endpoint وحده لا يحدد business logic.

------------------------------------------------------------------------

## 5. Response Structure --- نقطة لا بد من التحقق منها

الـ Collection لا تحتوي على أي saved response examples لطلبات التقارير
الثلاثة (`response: []`). لذلك لا يمكن تأكيد:

-   شكل الـ response النهائي: هل البيانات داخل `data` أم `data.results`
    أم مباشرة؟
-   أسماء الحقول وأنواعها.
-   هل الاستجابة تحتوي على summary/statistics بالإضافة إلى records؟
-   هل النتائج paginated؟ وما أسماء حقول pagination؟
-   هل السيرفر يعيد populated objects للطبيب والمريض أم IDs فقط؟
-   هل توجد totals محسوبة من الباك إند؟

**لا تنشئ TypeScript interfaces أو تربط الجدول على أسماء حقول متوقعة قبل
تجربة endpoints فعليًا.** نفّذ الطلبات في Postman أو من الـ Frontend،
واحفظ response حقيقيًا لكل تقرير، ثم عرّف الـ types بناءً عليه.

شكل توضيحي فقط --- وليس response contract:

``` ts
// Illustrative only. Do not use as the actual API type.
type ReportsResponse<T> = {
  status: string;
  message?: string;
  data: T;
};
```

إذا كانت الاستجابة الفعلية مختلفة، اتبعها كما هي أو استخدم adapter صغيرًا
في طبقة الـ API لتوحيد الشكل داخل الواجهة.

------------------------------------------------------------------------

## 6. Frontend Integration Structure

التزم بتقسيم المشروع الحالي، ولا تنقل أو تعيد كتابة الـ shared
infrastructure. المقترح التالي تنظيمي؛ عدّل المسارات لتطابق structure
الموجود بالفعل:

``` text
reports/
├── api/
│   └── reports.api.ts
├── hooks/
│   └── useReports.ts
├── types/
│   └── reports.types.ts
├── utils/
│   └── reports-params.ts
└── components/
    ├── ReportsFilters.tsx
    ├── AppointmentsReport.tsx
    ├── InvoicesReport.tsx
    └── PatientsReport.tsx
```

إذا كان المشروع يستخدم `modules/dashboard/...` أو feature-based
structure، ضع الملفات داخل نفس النمط بدل إنشاء structure موازٍ.

### API Layer

اجمع طلبات التقارير في service واحد، واستخدم Axios instance المركزي:

``` ts
import api from "@/lib/axios";

export const reportsApi = {
  getAppointments: (params: Record<string, unknown>) =>
    api.get("/reports/appointments", { params }),

  getInvoices: (params: Record<string, unknown>) =>
    api.get("/reports/invoice", { params }),

  getPatients: (params: Record<string, unknown>) =>
    api.get("/reports/patient", { params }),
};
```

> `@/lib/axios` مثال لمسار شائع. استخدم import path الحقيقي الموجود
> عندك. بعد معرفة response الفعلي، أضف types دقيقة بدل `unknown`، وحدد
> هل الـ service يعيد `response.data` أم Axios response وفق convention
> المشروع.

### Query Parameters Helper

ابنِ params من الفلاتر المختارة فقط:

``` ts
type DateRange = {
  startDate?: string;
  endDate?: string;
};

function cleanReportParams<T extends Record<string, unknown>>(params: T) {
  return Object.fromEntries(
    Object.entries(params).filter(
      ([, value]) => value !== undefined && value !== null && value !== ""
    )
  );
}
```

مثال استخدام:

``` ts
const params = cleanReportParams({
  status,
  type,
  doctor,
  startDate,
  endDate,
});
```

لا ترسل فلاتر تقرير المواعيد إلى تقرير الفواتير أو العكس؛ لكل تقرير
query params خاصة به.

### React Query

لو المشروع يستخدم TanStack Query بالفعل، استخدمه بنفس إعدادات الـ
QueryClient والـ conventions الحالية:

``` ts
const reportKeys = {
  all: ["reports"] as const,
  appointments: (filters: object) =>
    [...reportKeys.all, "appointments", filters] as const,
  invoices: (filters: object) =>
    [...reportKeys.all, "invoices", filters] as const,
  patients: (filters: object) =>
    [...reportKeys.all, "patients", filters] as const,
};
```

مثال:

``` ts
const appointmentsQuery = useQuery({
  queryKey: reportKeys.appointments(filters),
  queryFn: () => reportsApi.getAppointments(cleanReportParams(filters)),
  enabled: Boolean(filters.startDate && filters.endDate),
});
```

-   اجعل query key متضمنًا كل الفلاتر التي تؤثر في النتيجة.
-   لا تنفذ request جديدًا مع كل ضغطة أثناء اختيار التاريخ؛ حدّث filter
    state ثم نفّذ البحث بزر Apply إذا كان هذا هو سلوك التصميم الحالي.
-   لا تفرض شرط التاريخ في `enabled` إلا إذا كان الباك يتطلب التاريخين.
    الـ Collection لا تثبت أنهما required؛ هذه نقطة تُحسم مع الباك.
-   استخدم `keepPreviousData` أو البديل المتوافق مع إصدار TanStack Query
    في المشروع عند الحاجة لتجنب وميض الجدول أثناء تحديث الفلاتر.

------------------------------------------------------------------------

## 7. UI Behavior and Design System

الهدف هو أن تبدو Reports كجزء أصلي من Clinica، وليس صفحة مستقلة بتصميم
جديد.

### قواعد التنفيذ

1.  **أعد استخدام الـ shared components** الموجودة: PageHeader، Card،
    Button، Select، DatePicker، Table، Badge، Skeleton، EmptyState،
    Alert، حسب أسماء ومكونات المشروع الفعلية.
2.  استخدم design tokens الحالية للألوان والخلفيات والحدود والـ radius
    والـ spacing. ممنوع إضافة ألوان hardcoded أو إنشاء palette جديدة
    للتقارير.
3.  حافظ على نفس typography، أحجام العناوين، ارتفاع الحقول، أنماط
    الأزرار، والـ responsive breakpoints المستخدمة في بقية Dashboard.
4.  حافظ على RTL/LTR behavior من خلال آليات المشروع الحالية، خصوصًا ترتيب
    عناصر الفلاتر، اتجاه الأيقونات، ومحاذاة الأعمدة.
5.  لا تنشئ Table أو Filter components مكررة إذا كانت هناك مكونات عامة
    مستخدمة في أقسام مثل Patients أو Invoices.
6.  اجعل الفلاتر مناسبة للموبايل: يمكن أن تنتقل إلى صفوف متعددة أو
    container قابل للطي وفق pattern موجود في المشروع.

### الحالات التي يجب تصميمها

  -----------------------------------------------------------------------
  الحالة                              السلوك المطلوب
  ----------------------------------- -----------------------------------
  Initial                             عرض الشكل الافتراضي للتقرير بدون
                                      افتراض وجود بيانات

  Loading                             Skeleton متوافق مع شكل
                                      الجدول/البطاقات

  Success                             عرض بيانات التقرير حسب response
                                      contract

  Empty                               Empty state واضح عند عدم وجود نتائج

  Error                               رسالة مفهومة مع Retry، دون إظهار
                                      تفاصيل تقنية للمستخدم

  Filtered                            إظهار الفلاتر النشطة وإتاحة Reset

  Refetching                          الحفاظ على البيانات السابقة أو
                                      إظهار loading indicator خفيف حسب
                                      pattern المشروع
  -----------------------------------------------------------------------

### ترتيب مقترح للشاشة

-   Page header بعنوان Reports ووصف مختصر.
-   Tabs أو segmented navigation للتنقل بين Appointments وInvoices
    وPatients، بما يتفق مع أسلوب التنقل الموجود.
-   Filter area تختلف حسب التقرير.
-   Summary cards **فقط إذا كانت الاستجابة توفر أرقامًا واضحة لها**.
-   Data table أو visualization وفق طبيعة البيانات الفعلية.
-   Pagination فقط إذا كان endpoint يدعمها.

لا تضف Charts أو KPIs أو Export buttons باعتبارها مدعومة من الباك؛ الـ
Collection لا تحتوي على تفاصيل لهذه الوظائف.

------------------------------------------------------------------------

## 8. Date Handling

جميع أمثلة التواريخ في تقارير Postman بصيغة:

``` text
YYYY-MM-DD
```

استخدم هذه الصيغة في query params، ولا ترسل Date object أو
locale-formatted date مباشرة.

``` ts
function toApiDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}
```

هذا المثال يحافظ على التاريخ المحلي بدل تحويله تلقائيًا إلى UTC عبر
`toISOString()`، والذي قد يغيّر اليوم في بعض المناطق الزمنية.

**يجب تأكيد النقاط التالية مع Backend:**

-   هل `startDate` و`endDate` شاملان لليومين؟
-   أي field date يتم الفلترة عليه في كل تقرير؟
-   ما الـ timezone المعتمد عند بداية ونهاية اليوم؟
-   ماذا يحدث عند إرسال تاريخ بداية بعد تاريخ النهاية؟
-   هل التاريخان اختياريان أم مطلوبان؟

------------------------------------------------------------------------

## 9. Suggested Types After Inspecting Real Responses

بعد التقاط response حقيقي لكل endpoint، أنشئ type مستقلًا لكل تقرير. لا
تفترض أن records الخاصة بالتقارير مطابقة تمامًا لبيانات صفحات المواعيد
والفواتير والمرضى.

مثال للاتجاه المطلوب:

``` ts
export interface AppointmentsReportFilters {
  status?: string;
  type?: string;
  doctor?: string;
  startDate?: string;
  endDate?: string;
}

export interface InvoicesReportFilters {
  status?: string;
  paymentMethod?: string;
  doctor?: string;
  startDate?: string;
  endDate?: string;
}

export interface PatientsReportFilters {
  startDate?: string;
  endDate?: string;
}
```

هذه interfaces تصف query filters فقط، وهي مستنتجة من Postman Collection.
أضف response interfaces بعد فحص استجابات الباك.

------------------------------------------------------------------------

## 10. Testing Checklist

### API

-   [ ] الطلبات الثلاثة تعمل باستخدام user token صالح.
-   [ ] الطلب بدون filters يرجع السلوك المتوقع، إذا كان مسموحًا.
-   [ ] كل filter يغيّر النتائج بالشكل الصحيح.
-   [ ] دمج أكثر من filter يعمل بشكل صحيح.
-   [ ] doctor ID صالح وغير صالح يتم التعامل معهما بشكل واضح.
-   [ ] startDate وendDate يعملان على حدود الفترة بشكل صحيح.
-   [ ] لا توجد حاجة إلى trailing slash في invoice endpoint.
-   [ ] response schema وpagination (إن وجدت) موثقان من استجابة فعلية.

### Frontend

-   [ ] لا يوجد hardcoded token أو base URL.
-   [ ] لا يوجد duplicate Axios instance.
-   [ ] تغيير الفلاتر يحدّث query key والبيانات.
-   [ ] Reset يعيد الفلاتر إلى الحالة الافتراضية.
-   [ ] Loading / Empty / Error / Retry حالات مكتملة.
-   [ ] التصميم يستخدم shared components وdesign tokens.
-   [ ] RTL/LTR وresponsive layout يعملان.
-   [ ] لا تظهر بيانات تقرير قديم على أنها نتيجة الفلاتر الجديدة دون
    مؤشر refetch مناسب.

------------------------------------------------------------------------

## 11. Questions to Confirm with Backend

هذه أهم الأسئلة التي تمنع بناء UI أو types على افتراضات خاطئة:

1.  أرسل response JSON حقيقيًا لكل endpoint من الثلاثة.
2.  ما القيم المسموح بها لـ appointment `status` و`type`؟
3.  ما القيم المسموح بها لـ invoice `status` و`paymentMethod`؟
4.  هل `doctor` مدعوم رسميًا في appointments report؟ Postman يجعله
    Disabled في المثال.
5.  ما المقصود تحديدًا بـ Patients Report: المرضى الجدد أم المرضى الذين
    لديهم نشاط خلال الفترة؟
6.  هل التاريخان required؟ وهل `endDate` inclusive؟ وما الـ timezone؟
7.  هل توجد pagination؟ وما أسماء query params وresponse fields الخاصة
    بها؟
8.  هل توجد summary totals في response أم أن endpoint يعيد records فقط؟
9.  هل صلاحيات المستخدم تحدد البيانات التي يراها؟ وهل الطبيب يرى بياناته
    فقط أم يمكنه اختيار طبيب آخر؟

------------------------------------------------------------------------

## 12. Recommended Implementation Order

1.  شغّل endpoints الثلاثة في Postman واحفظ response فعليًا لكل واحد.
2.  اتفق مع Backend على الأسئلة الموجودة في القسم السابق، خصوصًا response
    shape وdate behavior.
3.  أنشئ API services وfilter types فقط، باستخدام الـ Axios instance
    الحالي.
4.  اربط كل تقرير منفصلًا بـ React Query، مع query keys مبنية على
    الفلاتر.
5.  ابنِ الفلاتر باستخدام shared form controls الموجودة.
6.  اربط النتائج في shared table/cards بعد تحديد response types.
7.  أكمل loading وempty وerror وreset وresponsive/RTL.
8.  اختبر كل filter منفردًا ثم اختبر دمج الفلاتر.

### الخلاصة

الـ Collection تؤكد وجود **3 GET endpoints** للتقارير: appointments
وinvoice وpatient. وتحدد query parameters لكل واحد، لكنها لا توفر
response examples أو توثيقًا لقيم الفلاتر أو pagination أو business
logic. لذلك أفضل مسار آمن هو تثبيت response contract أولًا، ثم ربط الـ
API داخل architecture الحالية، وبعدها بناء الواجهة باستخدام نفس shared
components وdesign tokens دون اختراع API fields أو features غير مؤكدة.
