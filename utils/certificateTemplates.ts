export interface CertificateTemplate {
  id: string;
  name: string;
  html: string;
}

export const certificateTemplates: CertificateTemplate[] = [
  {
    id: "default",
    name: "Default Template",
    html: `
      <div style="width: 800px; height: 600px; border: 2px solid #000; padding: 20px; text-align: center; font-family: Arial, sans-serif;">
        <h1 style="font-size: 36px; margin-bottom: 20px;">Certificate of Completion</h1>
        <p style="font-size: 24px; margin-bottom: 30px;">This certifies that</p>
        <h2 style="font-size: 30px; margin-bottom: 30px;">{{name}}</h2>
        <p style="font-size: 24px; margin-bottom: 30px;">has successfully completed the course</p>
        <h3 style="font-size: 28px; margin-bottom: 30px;">{{course}}</h3>
        <p style="font-size: 20px; margin-top: 50px;">Awarded on {{date}}</p>
      </div>
    `,
  },
  {
    id: "modern",
    name: "Modern Template",
    html: `
      <div style="width: 800px; height: 600px; border: 2px solid #3498db; padding: 20px; text-align: center; font-family: 'Helvetica', sans-serif; background-color: #f0f8ff;">
        <h1 style="font-size: 36px; color: #3498db; margin-bottom: 20px;">Achievement Unlocked</h1>
        <p style="font-size: 24px; margin-bottom: 30px;">Congratulations to</p>
        <h2 style="font-size: 30px; color: #2c3e50; margin-bottom: 30px;">{{name}}</h2>
        <p style="font-size: 24px; margin-bottom: 30px;">for mastering</p>
        <h3 style="font-size: 28px; color: #3498db; margin-bottom: 30px;">{{course}}</h3>
        <p style="font-size: 20px; margin-top: 50px; color: #7f8c8d;">Certified on {{date}}</p>
      </div>
    `,
  },
];

