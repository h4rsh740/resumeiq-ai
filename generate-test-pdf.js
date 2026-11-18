const { PDFDocument, StandardFonts, rgb } = require('pdf-lib');
const fs = require('fs');

async function createTestResume() {
  const doc = await PDFDocument.create();
  const fontRegular = await doc.embedFont(StandardFonts.Helvetica);
  const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);

  const page = doc.addPage([595.28, 841.89]);
  let y = 841.89 - 50;

  // Title
  page.drawText('John Doe', { x: 50, y, font: fontBold, size: 20 });
  y -= 24;

  // Contact
  page.drawText('john.doe@email.com  |  (555) 019-2834  |  github.com/johndoe', { x: 50, y, font: fontRegular, size: 10 });
  y -= 30;

  // Summary
  page.drawText('PROFESSIONAL SUMMARY', { x: 50, y, font: fontBold, size: 12 });
  y -= 15;
  page.drawText('Experienced Software Engineer seeking a challenging role to utilize my skills.', { x: 50, y, font: fontRegular, size: 10 });
  y -= 30;

  // Skills
  page.drawText('TECHNICAL SKILLS', { x: 50, y, font: fontBold, size: 12 });
  y -= 15;
  page.drawText('React, JavaScript, HTML, CSS, Git, REST APIs', { x: 50, y, font: fontRegular, size: 10 });
  y -= 30;

  // Experience
  page.drawText('WORK EXPERIENCE', { x: 50, y, font: fontBold, size: 12 });
  y -= 15;
  page.drawText('Software Engineer at Acme Corp (2021 - Present)', { x: 50, y, font: fontBold, size: 10 });
  y -= 15;
  page.drawText('- worked on front-end features using React and Javascript.', { x: 50, y, font: fontRegular, size: 10 });
  y -= 15;
  page.drawText('- helped with bugs and optimized page speed.', { x: 50, y, font: fontRegular, size: 10 });
  y -= 15;
  page.drawText('- responsible for deploying code and writing documentation.', { x: 50, y, font: fontRegular, size: 10 });
  y -= 30;

  // Projects
  page.drawText('PROJECTS', { x: 50, y, font: fontBold, size: 12 });
  y -= 15;
  page.drawText('E-Commerce Frontend', { x: 50, y, font: fontBold, size: 10 });
  y -= 15;
  page.drawText('- Built a responsive e-commerce storefront with React and CSS.', { x: 50, y, font: fontRegular, size: 10 });
  y -= 30;

  // Education
  page.drawText('EDUCATION', { x: 50, y, font: fontBold, size: 12 });
  y -= 15;
  page.drawText('Bachelor of Science in Computer Science - State University (2017 - 2021)', { x: 50, y, font: fontRegular, size: 10 });

  const pdfBytes = await doc.save();
  fs.writeFileSync('test-resume.pdf', pdfBytes);
  console.log('Successfully generated test-resume.pdf!');
}

createTestResume().catch(console.error);
