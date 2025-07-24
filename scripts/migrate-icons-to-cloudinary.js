const { v2: cloudinary } = require('cloudinary');
const fs = require('fs');
const path = require('path');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dlogj3gc8',
  api_key: process.env.CLOUDINARY_API_KEY || '426916362366118',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'u6Hyewut_KWe4nCfeWwIjUP3kdw'
});

async function migrateIconsToCloudinary() {
  const iconsDir = path.join(__dirname, '../public/icons-svg');
  const uploadResults = [];
  const errors = [];

  console.log('🚀 Starting icon migration to Cloudinary...');
  console.log(`📁 Reading icons from: ${iconsDir}`);

  try {
    // Check if icons directory exists
    if (!fs.existsSync(iconsDir)) {
      throw new Error(`Icons directory not found: ${iconsDir}`);
    }

    // Read all SVG files from the icons directory
    const files = fs.readdirSync(iconsDir).filter(file => file.endsWith('.svg'));
    console.log(`📊 Found ${files.length} SVG files to migrate`);

    // Upload each icon to Cloudinary
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const filePath = path.join(iconsDir, file);
      const iconName = path.basename(file, '.svg');
      
      console.log(`⬆️  Uploading ${i + 1}/${files.length}: ${file}`);

      try {
        const result = await cloudinary.uploader.upload(filePath, {
          public_id: `trucontext-icons/${iconName}`,
          folder: 'trucontext-icons',
          resource_type: 'image',
          format: 'svg',
          overwrite: true,
          tags: ['trucontext', 'icons', 'svg'],
          context: {
            source: 'migration',
            original_filename: file,
            upload_date: new Date().toISOString()
          }
        });

        uploadResults.push({
          filename: file,
          iconName: iconName,
          cloudinaryUrl: result.secure_url,
          publicId: result.public_id,
          success: true
        });

        console.log(`✅ Successfully uploaded: ${file} -> ${result.secure_url}`);
      } catch (uploadError) {
        console.error(`❌ Failed to upload ${file}:`, uploadError.message);
        errors.push({
          filename: file,
          error: uploadError.message,
          success: false
        });
      }
    }

    // Generate summary report
    console.log('\n📋 Migration Summary:');
    console.log(`✅ Successfully uploaded: ${uploadResults.length} icons`);
    console.log(`❌ Failed uploads: ${errors.length} icons`);

    if (uploadResults.length > 0) {
      console.log('\n🔗 Uploaded Icons:');
      uploadResults.forEach(result => {
        console.log(`  ${result.iconName}: ${result.cloudinaryUrl}`);
      });
    }

    if (errors.length > 0) {
      console.log('\n⚠️  Failed Uploads:');
      errors.forEach(error => {
        console.log(`  ${error.filename}: ${error.error}`);
      });
    }

    // Save migration report
    const report = {
      timestamp: new Date().toISOString(),
      totalFiles: files.length,
      successful: uploadResults.length,
      failed: errors.length,
      uploadResults,
      errors
    };

    const reportPath = path.join(__dirname, '../migration-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n📄 Migration report saved to: ${reportPath}`);

    return report;

  } catch (error) {
    console.error('💥 Migration failed:', error.message);
    throw error;
  }
}

// Run migration if script is executed directly
if (require.main === module) {
  migrateIconsToCloudinary()
    .then((report) => {
      console.log('\n🎉 Migration completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Migration failed:', error);
      process.exit(1);
    });
}

module.exports = { migrateIconsToCloudinary };

