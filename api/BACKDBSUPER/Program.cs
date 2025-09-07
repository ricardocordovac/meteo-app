using Microsoft.OpenApi.Models;
using Supabase;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "BACKDBSUPER", Version = "v1" });
});
builder.Services.AddHttpClient();
builder.Services.AddSingleton(new Supabase.Client(
    builder.Configuration["SUPABASE_URL"],
    builder.Configuration["SUPABASE_KEY"]
));

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseAuthorization();
app.MapControllers();

app.Run();