/**
 * SEO Auditor Utility
 * Analyzes blog content and metadata to provide a health score and suggestions.
 */

export const analyzeSEO = (blog) => {
    const issues = [];
    const actions = [];
    let score = 100;

    // 1. Title Analysis
    const title = blog.title || '';
    if (title.length < 30) {
        issues.push({ type: 'warning', message: 'Title is too short.' });
        actions.push('Expand your title to at least 50 characters to improve click-through rates.');
        score -= 10;
    } else if (title.length > 70) {
        issues.push({ type: 'warning', message: 'Title is too long.' });
        actions.push('Shorten your title to stay under 70 characters for search engine visibility.');
        score -= 5;
    }

    // 2. Meta Description Analysis
    const meta = blog.metaDescription || '';
    if (!meta) {
        issues.push({ type: 'error', message: 'Missing Meta Description.' });
        actions.push('Add a meta description to summarize your content for search results.');
        score -= 20;
    } else if (meta.length < 120) {
        issues.push({ type: 'warning', message: 'Meta description is too short.' });
        actions.push('Lengthen your meta description to provide more context (150-160 chars).');
        score -= 10;
    }

    // 3. Content Analysis
    const contentHtml = blog.contentHtml || '';
    const textOnly = contentHtml.replace(/<[^>]*>/g, ' ').trim();
    const wordCount = textOnly ? textOnly.split(/\s+/).length : 0;

    if (wordCount < 300) {
        issues.push({ type: 'warning', message: `Post is thin (${wordCount} words).` });
        actions.push('Write at least 300 words to provide value and improve ranking potential.');
        score -= 15;
    }

    // 4. Header Hierarchy
    const hasH1 = /<h1/i.test(contentHtml);
    const hasH2 = /<h2/i.test(contentHtml);

    if (hasH1) {
        issues.push({ type: 'warning', message: 'Internal H1 detected.' });
        actions.push('Convert internal H1 tags to H2/H3; the page title is your primary H1.');
        score -= 5;
    }
    if (!hasH2) {
        issues.push({ type: 'warning', message: 'Missing structure.' });
        actions.push('Add H2 subheadings to organize your content for readers and spiders.');
        score -= 5;
    }

    // 5. Image Alt Tags
    const images = contentHtml.match(/<img/gi) || [];
    const imagesWithAlt = contentHtml.match(/alt="[^"]+"/gi) || [];

    if (images.length > 0 && imagesWithAlt.length < images.length) {
        issues.push({ type: 'warning', message: 'Missing image alt text.' });
        actions.push(`Add alt text to the ${images.length - imagesWithAlt.length} images missing descriptions.`);
        score -= 10;
    }

    // 6. Keywords
    if (!blog.keywords) {
        issues.push({ type: 'info', message: 'No keywords defined.' });
        actions.push('Define primary keywords to help the auditor check for density.');
    }

    score = Math.max(0, score);

    return {
        score,
        issues,
        actions,
        wordCount,
        hasMeta: !!meta,
        imageCoverage: images.length > 0 ? (imagesWithAlt.length / images.length) * 100 : 100
    };
};

export const calculateGlobalSEO = (blogs) => {
    if (!blogs || blogs.length === 0) return 0;
    const totalScore = blogs.reduce((acc, blog) => acc + analyzeSEO(blog).score, 0);
    return Math.round(totalScore / (blogs.length || 1));
};
