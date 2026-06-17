const SUPABASE_URL =
'https://ydrnkwhejhbatwnnhgwi.supabase.co';

const SUPABASE_ANON_KEY =
'sb_publishable__O2DCqsyNB7WLEIjuYjeNw_KdlqT4rw';

const { createClient } = supabase;

const db = createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);

async function cargarTareas(){

    const { data, error } =
    await db
    .from('tareas')
    .select('*')
    .order('created_at');

    if(error){
        console.error(error);
        return;
    }

    renderTareas(data);
}

db.channel('tareas-canal')

.on(
'postgres_changes',
{
event:'*',
schema:'public',
table:'tareas'
},
() => {
cargarTareas();
}
)

.subscribe();

async function agregarTarea(){

    const titulo =
    document
    .getElementById('titulo')
    .value
    .trim();

    const responsable =
    document
    .getElementById('responsable')
    .value
    .trim();

    if(!titulo || !responsable){

        alert(
        'Complete todos los campos'
        );

        return;
    }

    await db
    .from('tareas')
    .insert({
        titulo,
        responsable
    });

    document
    .getElementById('titulo')
    .value='';

    document
    .getElementById('responsable')
    .value='';
}

async function toggleEstado(
id,
estado
){

    await db
    .from('tareas')
    .update({
        completada:!estado
    })
    .eq('id',id);
}

async function eliminarTarea(id){

    const confirmar =
    confirm(
    '¿Desea eliminar la tarea?'
    );

    if(!confirmar) return;

    await db
    .from('tareas')
    .delete()
    .eq('id',id);
}

function renderTareas(tareas){

    const contenedor =
    document.getElementById(
    'tareas-container'
    );

    document
    .getElementById(
    'contador'
    )
    .textContent =
    '(' + tareas.length + ')';

    if(tareas.length===0){

        contenedor.innerHTML=
        '<p class="vacio">No existen tareas</p>';

        return;
    }

    contenedor.innerHTML=
    tareas.map(t=>`

    <div class="tarea ${t.completada ? 'completada' : ''}">

        <div class="tarea-info">

            <strong>${t.titulo}</strong>

            <span>
            Responsable:
            ${t.responsable}
            </span>

        </div>

        <div>

            <button
            onclick="toggleEstado('${t.id}', ${t.completada})">

            ${t.completada
            ? 'Reabrir'
            : 'Completar'}

            </button>

            <button
            class="btn-eliminar"
            onclick="eliminarTarea('${t.id}')">

            Eliminar

            </button>

        </div>

    </div>

    `).join('');
}

cargarTareas();