
export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col">

      <div className="py-8 px-4">
        <div className="container mx-auto max-w-4xl">
          <h1 className="text-3xl font-bold mb-8 text-center">درباره کفش لند</h1>

          <div className="card p-8 mb-8">
            <h2 className="text-2xl font-bold mb-4">داستان ما</h2>
            <p className="text-mist leading-relaxed mb-4">
              کفش لند در سال ۱۳۹۵ با هدف ارائه کیفیت‌ترین کفش‌های چرم طبیعی به مشتریان ایرانی راه‌اندازی شد. ما معتقدیم که هر قدم شما باید با راحتی و اطمینان همراه باشد.
            </p>
            <p className="text-mist leading-relaxed mb-4">
              با استفاده از بهترین چرم‌های طبیعی و تکنولوژی‌های روز دنیا، محصولاتی را تولید می‌کنیم که هم زیبا و هم با دوام هستند. هر جفت کفش ما حاصل ساعت‌ها دقت و ظرافت دست‌سازی است.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="card p-6">
              <h3 className="text-xl font-bold mb-3">ماموریت ما</h3>
              <p className="text-mist leading-relaxed">
                ارائه بهترین تجربه خرید کفش با تضمین کیفیت و قیمت مناسب برای همه هم‌وطنان در سراسر کشور
              </p>
            </div>

            <div className="card p-6">
              <h3 className="text-xl font-bold mb-3">چشم‌انداز ما</h3>
              <p className="text-mist leading-relaxed">
                تبدیل شدن به بزرگترین فروشگاه اینترنتی کفش چرم طبیعی در ایران و منطقه
              </p>
            </div>
          </div>

          <div className="card p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">آمار و ارقام</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <p className="text-4xl font-bold text-brand mb-2">+۱۰۰۰</p>
                <p className="text-mist">محصول</p>
              </div>
              <div>
                <p className="text-4xl font-bold text-brand mb-2">+۵۰</p>
                <p className="text-mist">برند</p>
              </div>
              <div>
                <p className="text-4xl font-bold text-brand mb-2">+۵۰K</p>
                <p className="text-mist">مشتری راضی</p>
              </div>
              <div>
                <p className="text-4xl font-bold text-brand mb-2">۹</p>
                <p className="text-mist">سال تجربه</p>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}