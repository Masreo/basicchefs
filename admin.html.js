

let recipes = JSON.parse(localStorage.getItem('basicchefs_v2_recipes') || 'null') || defaultRecipes;
let aboutContent = JSON.parse(localStorage.getItem('basicchefs_v2_about') || 'null') || defaultAbout;

function nextId() { return recipes.length > 0 ? Math.max(...recipes.map(r => r.id)) + 1 : 1; }
function saveData() { localStorage.setItem('basicchefs_v2_recipes', JSON.stringify(recipes)); }

function showToast(msg) {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 2800);
}

function downloadSiteData() {
    const src = "// Basic Chefs - site content\n// Upload this file to your host, replacing the old site-data.js.\n\nconst defaultRecipes = " + JSON.stringify(recipes) + ";\n\nconst defaultAbout = " + JSON.stringify(aboutContent) + ";\n";
    const blob = new Blob([src], {type: 'text/javascript; charset=utf-8'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'site-data.js';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(a.href); }, 200);
}

function exportRecipes() {
    if (recipes.length === 0) { showToast('No recipes added yet!'); return; }
    downloadSiteData();
    showToast('site-data.js downloaded - upload it to your site to go live!');
}

function switchTab(tab) {
    const isRecipes = tab === 'recipes';
    document.getElementById('tab-recipes').classList.toggle('active', isRecipes);
    document.getElementById('tab-about').classList.toggle('active', !isRecipes);
    document.getElementById('admin-list-view').style.display = isRecipes ? 'block' : 'none';
    document.getElementById('recipe-form').style.display = 'none';
    document.getElementById('admin-about-view').style.display = isRecipes ? 'none' : 'block';
    if (!isRecipes) {
        document.getElementById('about-heading-input').value = aboutContent.heading;
        document.getElementById('about-text-input').value = aboutContent.text;
    }
}

function saveAbout() {
    aboutContent.heading = document.getElementById('about-heading-input').value.trim() || defaultAbout.heading;
    aboutContent.text = document.getElementById('about-text-input').value.trim() || defaultAbout.text;
    localStorage.setItem('basicchefs_v2_about', JSON.stringify(aboutContent));
    downloadSiteData();
    showToast('About section saved - site-data.js downloaded, upload it to go live!');
}

function openAdmin() {
    renderAdminList();
    switchTab('recipes');
    document.getElementById('admin-overlay').style.display = 'block';
}
function closeAdmin() {
    window.location.href = 'index.html';
}
function handleOverlayClick(e) {
    // standalone admin page - clicking outside does nothing
}
function renderAdminList() {
    const list = document.getElementById('admin-recipe-list');
    if (recipes.length === 0) {
        list.innerHTML = '<p style="color:#999;padding:16px 0;">No recipes yet. Add your first one below.</p>';
        return;
    }
    list.innerHTML = [...recipes].reverse().map(r => `
        <div class="admin-recipe-row">
            <img class="admin-recipe-thumb" src="${r.image}" alt="${r.title}" onerror="this.style.opacity=0.3">
            <div style="flex:1">
                <div class="admin-recipe-name">${r.title}</div>
                <div class="admin-recipe-meta">${r.difficulty} · ${r.time} · Serves ${r.servings}</div>
            </div>
            <button class="btn btn-edit" onclick="openForm(${r.id})">Edit</button>
            <button class="btn btn-delete" onclick="deleteRecipe(${r.id})">Delete</button>
        </div>
    `).join('');
}
function openForm(id) {
    document.getElementById('admin-list-view').style.display = 'none';
    document.getElementById('recipe-form').style.display = 'block';
    if (id === null) {
        document.getElementById('form-title').textContent = 'Add New Recipe';
        ['id','title','desc','time','servings','image','ingredients','steps','tips','cost'].forEach(f => document.getElementById('field-'+f).value = '');
        document.getElementById('field-difficulty').value = 'Easy';
        document.getElementById('image-preview').src = '';
        document.getElementById('image-preview').style.opacity = 0;
    } else {
        const r = recipes.find(r => r.id === id);
        document.getElementById('form-title').textContent = 'Edit Recipe';
        document.getElementById('field-id').value = r.id;
        document.getElementById('field-title').value = r.title;
        document.getElementById('field-desc').value = r.description;
        document.getElementById('field-time').value = r.time;
        document.getElementById('field-servings').value = r.servings;
        document.getElementById('field-difficulty').value = r.difficulty;
        document.getElementById('field-image').value = r.image;
        document.getElementById('field-ingredients').value = r.ingredients.join('\n');
        document.getElementById('field-steps').value = r.steps.join('\n');
        document.getElementById('field-tips').value = (r.tips || []).join('\n');
        document.getElementById('field-cost').value = r.cost || '';
        document.getElementById('image-preview').src = r.image;
        document.getElementById('image-preview').style.opacity = 1;
    }
}
function closeForm() {
    document.getElementById('recipe-form').style.display = 'none';
    document.getElementById('admin-list-view').style.display = 'block';
}
function previewImage(url) { document.getElementById('image-preview').src = url; }

function handlePhotoUpload(input) {
    const file = input.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
        const img = new Image();
        img.onload = function() {
            const maxW = 900;
            const scale = img.width > maxW ? maxW / img.width : 1;
            const canvas = document.createElement('canvas');
            canvas.width = img.width * scale;
            canvas.height = img.height * scale;
            canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
            const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
            document.getElementById('field-image').value = dataUrl;
            document.getElementById('image-preview').src = dataUrl;
            document.getElementById('image-preview').style.opacity = 1;
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}
function saveRecipe() {
    const id = document.getElementById('field-id').value;
    const title = document.getElementById('field-title').value.trim();
    if (!title) { alert('Please enter a recipe title.'); return; }
    const recipe = {
        id: id ? parseInt(id) : nextId(),
        title,
        description: document.getElementById('field-desc').value.trim(),
        image: document.getElementById('field-image').value.trim(),
        time: document.getElementById('field-time').value.trim() || '—',
        servings: document.getElementById('field-servings').value.trim() || '—',
        difficulty: document.getElementById('field-difficulty').value,
        ingredients: document.getElementById('field-ingredients').value.split('\n').map(s => s.trim()).filter(Boolean),
        steps: document.getElementById('field-steps').value.split('\n').map(s => s.trim()).filter(Boolean),
        tips: document.getElementById('field-tips').value.split('\n').map(s => s.trim()).filter(Boolean),
        cost: parseFloat(document.getElementById('field-cost').value) || null,
    };
    if (id) {
        recipes[recipes.findIndex(r => r.id === parseInt(id))] = recipe;
    } else {
        recipes.push(recipe);
    }
    saveData();
    renderAdminList();
    closeForm();
    downloadSiteData();
    showToast((id ? 'Recipe updated' : 'Recipe added') + ' - site-data.js downloaded, upload it to go live!');
}
function importRecipes(input) {
    const file = input.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const imported = JSON.parse(e.target.result);
            if (!Array.isArray(imported)) throw new Error();
            if (!confirm(`This will replace your current ${recipes.length} recipe(s) with ${imported.length} from the backup. Continue?`)) return;
            recipes = imported;
            saveData();
            renderAdminList();
            showToast(`${imported.length} recipes restored - click Save on any recipe or Export to publish`);
        } catch {
            showToast('Invalid backup file. Please try again.');
        }
    };
    reader.readAsText(file);
    input.value = '';
}
function deleteRecipe(id) {
    if (!confirm('Delete this recipe? This cannot be undone.')) return;
    recipes = recipes.filter(r => r.id !== id);
    saveData();
    renderAdminList();
    downloadSiteData();
    showToast('Recipe deleted - site-data.js downloaded, upload it to go live!');
}

openAdmin();

