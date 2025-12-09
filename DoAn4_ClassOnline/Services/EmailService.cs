using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;

namespace DoAn4_ClassOnline.Services
{
    public class EmailService : IEmailService
    {
        private readonly IConfiguration _configuration;

        public EmailService(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public async Task<bool> SendEmailAsync(string toEmail, string subject, string body)
        {
            try
            {
                var email = new MimeMessage();
                
                // Email người gửi
                email.From.Add(new MailboxAddress(
                    _configuration["EmailSettings:SenderName"], 
                    _configuration["EmailSettings:SenderEmail"]
                ));
                
                // Email người nhận
                email.To.Add(MailboxAddress.Parse(toEmail));
                
                email.Subject = subject;
                
                var builder = new BodyBuilder
                {
                    HtmlBody = body
                };
                
                email.Body = builder.ToMessageBody();

                using var smtp = new SmtpClient();
                
                // Kết nối SMTP
                await smtp.ConnectAsync(
                    _configuration["EmailSettings:SmtpServer"],
                    int.Parse(_configuration["EmailSettings:SmtpPort"]),
                    SecureSocketOptions.StartTls
                );
                
                // Xác thực
                await smtp.AuthenticateAsync(
                    _configuration["EmailSettings:SenderEmail"],
                    _configuration["EmailSettings:Password"]
                );
                
                // Gửi email
                await smtp.SendAsync(email);
                await smtp.DisconnectAsync(true);
                
                return true;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error sending email: {ex.Message}");
                return false;
            }
        }
    }
}