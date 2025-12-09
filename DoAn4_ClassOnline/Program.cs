using Microsoft.EntityFrameworkCore;
using DoAn4_ClassOnline.Models;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllersWithViews();

// Đăng ký DbContext
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// ⭐ XÓA AUTHENTICATION - CHỈ GIỮ SESSION ⭐
// Thêm Session cho login
builder.Services.AddSession(options =>
{
    options.IdleTimeout = TimeSpan.FromMinutes(30);
    options.Cookie.HttpOnly = true;
    options.Cookie.IsEssential = true;
    // ⭐ ĐẢAM BẢO SESSION SẼ MẤT KHI ĐÓNG BROWSER ⭐
    options.Cookie.SameSite = SameSiteMode.Lax;
});

builder.Services.AddSingleton<IHttpContextAccessor, HttpContextAccessor>();
builder.Services.AddHttpContextAccessor();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();

app.UseRouting();
app.UseStaticFiles();
app.UseSession(); // Chỉ dùng Session

// ⭐ XÓA app.UseAuthentication() VÀ app.UseAuthorization() ⭐

// Routing cho Areas
app.MapControllerRoute(
    name: "areas",
    pattern: "{area=Admin}/{controller=DangNhap}/{action=Index}/{id?}");

// Routing mặc định
app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}");

app.Run();