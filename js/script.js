import { db } from './firebase-config.js';
import { collection, getDocs, query, where, doc, updateDoc } from 'https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js';

let todasLasFamilias = [];

// Función para normalizar texto (sin tildes y minúsculas)
function normalizarTexto(texto) {
    return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

// Buscar apellidos parcial y sin tildes
export async function buscarFamilia() {
    const apellidoInput = document.getElementById('apellidoInput').value.trim();
    const apellidoNormalizado = normalizarTexto(apellidoInput);
    const familiaDiv = document.getElementById('familia');
    familiaDiv.innerHTML = '';

    if (!apellidoNormalizado) return;

    // Traer datos solo la primera vez
    if (todasLasFamilias.length === 0) {
        const querySnapshot = await getDocs(collection(db, 'familias'));
        querySnapshot.forEach(docSnap => {
            todasLasFamilias.push({ id: docSnap.id, ...docSnap.data() });
        });
    }

    // Filtrar por coincidencias
    const coincidencias = todasLasFamilias.filter(f =>
        f.Apellido && normalizarTexto(f.Apellido).includes(apellidoNormalizado)
    );

    const contenedor = document.createElement('div');
    contenedor.classList.add('botones-centrados');

    if (coincidencias.length > 0) {
        coincidencias.forEach(familia => {
            const btn = document.createElement('button');
            btn.textContent = familia.Apellido;
            btn.onclick = () => mostrarIntegrantes(familia.id);
            contenedor.appendChild(btn);
        });
        familiaDiv.appendChild(contenedor);
    } else {
        const mensaje = document.createElement('div');
        mensaje.classList.add('mensaje-exito');
        mensaje.textContent = 'No se encontraron familias con ese apellido.';
        familiaDiv.appendChild(mensaje);
    }
}

// Mostrar integrantes de la familia
async function mostrarIntegrantes(docId) {
    const familiaDiv = document.getElementById('familia');
    familiaDiv.innerHTML = '';

    const docSnap = await getDocs(query(collection(db, 'familias'), where('__name__', '==', docId)));
    let miembrosDisponibles = 0;

    docSnap.forEach(snap => {
        const data = snap.data();
        data.Miembros.forEach((miembro, idx) => {
            if (miembro.Asistencia !== 'Asistirá') {
                miembrosDisponibles++;
                const div = document.createElement('div');
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.id = `${docId}_${idx}`;
                checkbox.dataset.docid = docId;
                checkbox.dataset.index = idx;
                const label = document.createElement('label');
                label.textContent = miembro.Nombre;
                div.appendChild(checkbox);
                div.appendChild(label);
                familiaDiv.appendChild(div);
            }
        });
    });

    if (miembrosDisponibles === 0) {
        const mensaje = document.createElement('div');
        mensaje.classList.add('mensaje-exito');
        mensaje.textContent = '🎉 ¡Todos los miembros de esta familia ya confirmaron asistencia!';
        familiaDiv.appendChild(mensaje);
        setTimeout(() => {
            mensaje.remove();
            document.getElementById('apellidoInput').value = '';
        }, 4000);
    }
}

// Guardar confirmación
export async function guardarConfirmacion() {
    const checkboxes = document.querySelectorAll('#familia input[type=checkbox]:checked');
    if (checkboxes.length === 0) {
        mostrarMensajeAdvertencia();
        return;
    }

    for (let checkbox of checkboxes) {
        const docId = checkbox.dataset.docid;
        const index = checkbox.dataset.index;
        const docRef = doc(db, 'familias', docId);
        const docSnap = await getDocs(query(collection(db, 'familias'), where('__name__', '==', docId)));
        docSnap.forEach(async snap => {
            const data = snap.data();
            data.Miembros[index].Asistencia = 'Asistirá';
            await updateDoc(docRef, { Miembros: data.Miembros });
        });
    }

    mostrarTarjetaConfirmacion();
    setTimeout(() => {
        document.getElementById('apellidoInput').value = '';
        document.getElementById('familia').innerHTML = '';
    }, 4000);
}

// Mostrar mensaje si no seleccionan nadie
function mostrarMensajeAdvertencia() {
    const mensaje = document.getElementById('mensajeAdvertencia');
    mensaje.classList.add('mostrar');
    mensaje.classList.remove('oculto');
    setTimeout(() => {
        mensaje.classList.remove('mostrar');
        mensaje.classList.add('oculto');
    }, 4000);
}

// Mostrar tarjeta de éxito
export function mostrarTarjetaConfirmacion() {
    const tarjeta = document.getElementById('mensajeConfirmacion');
    tarjeta.classList.add('mostrar');
    tarjeta.classList.remove('oculto');
    setTimeout(() => {
        tarjeta.classList.remove('mostrar');
        tarjeta.classList.add('oculto');
    }, 4000);
}

// Función para mostrar lista de confirmados
export async function cargarConfirmados() {
  const confirmadosDiv = document.getElementById('confirmados');
  if (!confirmadosDiv) return;

  const familiasRef = collection(db, 'familias');
  const querySnapshot = await getDocs(familiasRef);

  let confirmados = [];
  querySnapshot.forEach(docSnap => {
      const data = docSnap.data();
      data.Miembros.forEach(miembro => {
          if (miembro.Asistencia === 'Asistirá') {
              confirmados.push(miembro.Nombre);
          }
      });
  });

  confirmadosDiv.innerHTML = ''; // limpiar contenido anterior

  if (confirmados.length === 0) {
      confirmadosDiv.textContent = 'No hay confirmaciones aún.';
  } else {
      const ul = document.createElement('ul');
      confirmados.forEach(nombre => {
          const li = document.createElement('li');
          li.textContent = nombre;
          ul.appendChild(li);
      });
      confirmadosDiv.appendChild(ul);
  }
}
