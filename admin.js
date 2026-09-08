const cfg=window.MRKING_CONFIG||{};
let sb=null, editing=null, imageUrl="", currentUser=null;
const $=id=>document.getElementById(id);
const configured=!!(cfg.SUPABASE_URL&&cfg.SUPABASE_ANON_KEY);
if(configured) sb=window.supabase.createClient(cfg.SUPABASE_URL,cfg.SUPABASE_ANON_KEY); else $("setupNotice").hidden=false;

function show(t){$("status").textContent=t;$("status").style.display="block";setTimeout(()=>$("status").style.display="none",2800)}
function esc(s=""){return String(s).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]))}
function reset(){editing=null;imageUrl="";$("postForm").reset();$("tryOn").checked=true;$("published").checked=true;$("postId").value="";$("formTitle").textContent="Novo produto";$("cancel").hidden=true;$("preview").hidden=true}
async function boot(){
 if(!configured)return;
 const {data:{session}}=await sb.auth.getSession(); if(session) enter(session.user);
 sb.auth.onAuthStateChange((_e,s)=>s?enter(s.user):leave());
}
async function enter(user){currentUser=user; $("login").hidden=true;$("app").hidden=false;$("logoutBtn").hidden=false;await render();await loadLeads()}
function leave(){currentUser=null;$("login").hidden=false;$("app").hidden=true;$("logoutBtn").hidden=true}
$("loginForm").onsubmit=async e=>{e.preventDefault();if(!sb){$("loginError").textContent="Supabase não configurado.";return} const {error}=await sb.auth.signInWithPassword({email:$("email").value,password:$("password").value});$("loginError").textContent=error?error.message:""}
$("logoutBtn").onclick=()=>sb?.auth.signOut();
async function render(){
 const {data,error}=await sb.from("products").select("*").order("created_at",{ascending:false});
 if(error){show("Erro ao carregar produtos: "+error.message);return}
 $("count").textContent=(data||[]).length+" produto(s)";
 $("posts").innerHTML=data?.length?data.map(p=>`<article class="post"><img src="${esc(p.image_url||"assets/feed-1.jpg")}" alt=""><div><h3>${esc(p.title)}</h3><p>${esc(p.description)}</p><strong>${esc(p.price||"Consulte")}</strong><small>${esc(p.category)} • ${esc(p.sizes||"")} • ${p.published?"Publicado":"Oculto"} • IA ${p.try_on?"ON":"OFF"}</small></div><div class="postBtns"><button onclick="editPost('${p.id}')">Editar</button><button class="delete" onclick="deletePost('${p.id}')">Excluir</button></div></article>`).join(""):'<div class="empty">Nenhum produto.</div>';
}
window.editPost=async id=>{const {data}=await sb.from("products").select("*").eq("id",id).single();if(!data)return;editing=id;imageUrl=data.image_url||"";$("formTitle").textContent="Editar produto";$("postId").value=id;$("title").value=data.title;$("description").value=data.description;$("price").value=data.price;$("sizes").value=data.sizes;$("category").value=data.category;$("tryOn").checked=data.try_on;$("published").checked=data.published;if(imageUrl){$("preview").src=imageUrl;$("preview").hidden=false}$("cancel").hidden=false;scrollTo({top:0,behavior:"smooth"})}
window.deletePost=async id=>{if(!confirm("Excluir este produto?"))return;const {error}=await sb.from("products").delete().eq("id",id);if(error)show(error.message);else{show("Produto excluído.");await render()}}
$("image").onchange=e=>{const f=e.target.files[0];if(!f)return;$("preview").src=URL.createObjectURL(f);$("preview").hidden=false}
$("postForm").onsubmit=async e=>{e.preventDefault();let image=imageUrl;const f=$("image").files[0];
 if(f){const ext=f.name.split(".").pop().toLowerCase();const path=`${crypto.randomUUID()}.${ext}`;const up=await sb.storage.from("products").upload(path,f,{upsert:false,contentType:f.type});if(up.error){show("Erro no upload: "+up.error.message);return}image=sb.storage.from("products").getPublicUrl(path).data.publicUrl}
 const row={title:$("title").value.trim(),description:$("description").value.trim(),price:$("price").value.trim()||"Consulte",sizes:$("sizes").value.trim()||"Consulte",category:$("category").value,try_on:$("tryOn").checked,published:$("published").checked,image_url:image||"assets/feed-1.jpg",updated_at:new Date().toISOString()};
 const q=editing?sb.from("products").update(row).eq("id",editing):sb.from("products").insert(row);const {error}=await q;if(error)show(error.message);else{show("Produto salvo online.");reset();await render()}}
$("cancel").onclick=reset;
$("refreshLeads").onclick=loadLeads;
async function loadLeads(){if(!sb||!currentUser)return;const {data,error}=await sb.from("leads").select("*").order("created_at",{ascending:false}).limit(30);if(error){$("leads").innerHTML='<div class="empty">Não foi possível carregar interessados.</div>';return}$("leads").innerHTML=data?.length?data.map(x=>`<div class="lead"><b>${esc(x.product_title||"Produto")}</b><span>${esc(x.whatsapp||"WhatsApp não informado")}</span><small>${esc(x.event_type)} • ${new Date(x.created_at).toLocaleString("pt-BR")}</small></div>`).join(""):'<div class="empty">Ainda não há interessados.</div>'}
$("exportBtn").onclick=async()=>{const {data}=await sb.from("products").select("*").order("created_at",{ascending:false});const blob=new Blob([JSON.stringify(data||[],null,2)],{type:"application/json"});const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="mrking-produtos-backup.json";a.click();URL.revokeObjectURL(a.href)}
boot();
