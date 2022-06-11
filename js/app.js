let cliente = {
    fecha: '',
    hora: '',
    pedido: []
};

const categorias = {
    1: 'Comida',
    2: 'Bebidas',
    3: 'Postres'
}

const btnGuardarCliente = document.querySelector('#guardar-cliente');
btnGuardarCliente.addEventListener('click', guardarCliente);

function guardarCliente() {
    const fecha = document.querySelector('#fecha').value;
    const hora = document.querySelector('#hora').value;

    // revisar si hay campos vacios
    const camposVacios = [ fecha, hora ].some( campo => campo === '' );

    if (camposVacios) {
        // verificar si ya hay una alerta
        const existeAlerta = document.querySelector('.invalid-feedback');

        if(!existeAlerta) {
            const alerta = document.createElement('DIV');
            alerta.classList.add('invalid-feedback', 'd-block', 'text-center', 'text-uppercase');
            alerta.textContent = 'Todos los campos son obligatorios';
            document.querySelector('.modal-body form').appendChild(alerta);

            setTimeout(() => {
                alerta.remove();
            }, 2500);
        }

        return;
    }
    // asignar datos del formulario a cliente
    cliente = { ...cliente, fecha, hora };

    /* console.log(cliente); */

    // Ocultar modal
    const modalFormulario = document.querySelector('#formulario');
    const modalBootstrap = bootstrap.Modal.getInstance(modalFormulario);
    modalBootstrap.hide();

    // mostrar las secciones
    mostrarSecciones();
    
    // obtener platillos de la api de JSON-SERVER
    obtenerPlatillos();
}

function mostrarSecciones() {
    const seccionesOcultas = document.querySelectorAll('.d-none');
    seccionesOcultas.forEach( seccion => seccion.classList.remove('d-none') );
}

function obtenerPlatillos() {
    const url = 'https://pedidos-pizza.herokuapp.com/platillos';

    fetch(url)
        .then( respuesta => respuesta.json() )
        .then( resultado => mostrarPlatillos(resultado))
        .catch( error => console.log(error) );
}

function mostrarPlatillos(platillos) {
    const contenido = document.querySelector('#platillos .contenido');

    platillos.forEach( platillo => {
        const row = document.createElement('DIV');
        row.classList.add('row', 'py-3', 'border-top');

        const nombre = document.createElement('DIV');
        nombre.classList.add('col-md-4', 'text-white');
        nombre.textContent = platillo.nombre;

        const precio = document.createElement('DIV');
        precio.classList.add('col-md-3', 'fw-bold', 'text-white');
        precio.textContent = `S/.${platillo.precio}`;

        const categoria = document.createElement('DIV', 'text-white');
        categoria.classList.add('col-md-3');
        categoria.textContent = categorias[ platillo.categoria ];

        const inputCantidad = document.createElement('INPUT');
        inputCantidad.type = 'number';
        inputCantidad.min = 0;
        inputCantidad.value = 0;
        inputCantidad.id = `producto-${platillo.id}`;
        inputCantidad.classList.add('form-control', 'bg-body', 'text-white');

        // funcion que detecte la cantidad y el platillo que se está agregando
        inputCantidad.onchange = function(){
            const cantidad = parseInt( inputCantidad.value );
            agregarPlatillo({...platillo, cantidad});
        };

        const agregar = document.createElement('DIV');
        agregar.classList.add('col-md-2');
        agregar.appendChild(inputCantidad);

        row.appendChild(nombre);
        row.appendChild(precio);
        row.appendChild(categoria);
        row.appendChild(agregar);

        contenido.appendChild(row);
    })
}

function agregarPlatillo(producto) {
    // extraer el pedido actual
    let { pedido } = cliente;
    // revisar que la cantidad sea mayor a 0
    if (producto.cantidad > 0) {

        if( pedido.some( articulo => articulo.id === producto.id ) ) {
            // actualizar la cantidad porque ya existe
            const pedidoActualizado = pedido.map( articulo => {
                if( articulo.id === producto.id ) {
                    articulo.cantidad = producto.cantidad;
                }
                return articulo;
            } );
            // se asigna el nuevo array al cliente.pedido
            cliente.pedido = [...pedidoActualizado];
        } else {
            // el articulo no existe, lo agrgamos al array de pedido
            cliente.pedido = [...pedido, producto];
        }

    } else {
        // eliminar elementos cuando la cantidad es 0
        const resultado = pedido.filter( articulo => articulo.id !== producto.id );
        cliente.pedido = [...resultado];
    }
    // limpiar el codigo html previo
    limpiarHTML();

    if( cliente.pedido.length ) {
        // mostrar el resumen
        actualizarResumen();
    } else {
        mensajePedidoVacio();
    }

    
}

function actualizarResumen() {
    const contenido = document.querySelector('#resumen .contenido');

    const resumen = document.createElement('DIV');
    resumen.classList.add('col-md-6', 'card', 'py-2', 'px-3', 'shadow-lg');

    // informacion de la mesa
    const fecha = document.createElement('P');
    fecha.textContent = 'Fecha: ';
    fecha.classList.add('fw-bold', 'text-black');

    const fechaSpan = document.createElement('SPAN');
    fechaSpan.textContent = dateFormat( cliente.fecha, 'dd/MM/yyyy');
    fechaSpan.classList.add('fw-normal', 'text-black');

    // informacion de la hora
    const hora = document.createElement('P');
    hora.textContent = 'Hora: ';
    hora.classList.add('fw-bold', 'text-black');

    const horaSpan = document.createElement('SPAN');
    horaSpan.textContent = cliente.hora;
    horaSpan.classList.add('fw-normal', 'text-black');

    //agregar a los elementos padre
    fecha.appendChild(fechaSpan);
    hora.appendChild(horaSpan);

    // titulo de la seccion
    const heading = document.createElement('H3');
    heading.textContent = 'Platillos Consumidos';
    heading.classList.add('my-4', 'text-center', 'text-black');

    // Iterar sobre el array de pedidos
    const grupo = document.createElement('UL');
    grupo.classList.add('list-group');

    const { pedido } = cliente;
    pedido.forEach( articulo => {
        const { nombre, cantidad, precio, id } = articulo;

        const lista = document.createElement('LI');
        lista.classList.add('list-group-item');

        const nombreEl = document.createElement('H4');
        nombreEl.classList.add('my-4');
        nombreEl.textContent = nombre;

        // cantidad del articulo
        const cantidadEl = document.createElement('P');
        cantidadEl.classList.add('fw-bold');
        cantidadEl.textContent = 'Cantidad: ';

        const cantidadValor = document.createElement('SPAN');
        cantidadValor.classList.add('fw-normal');
        cantidadValor.textContent = cantidad;

        // precio del articulo
        const precioEl = document.createElement('P');
        precioEl.classList.add('fw-bold');
        precioEl.textContent = 'Precio: ';

        const precioValor = document.createElement('SPAN');
        precioValor.classList.add('fw-normal');
        precioValor.textContent = `S/.${precio}`;

        // subtotal del articulo
        const subtotalEl = document.createElement('P');
        subtotalEl.classList.add('fw-bold');
        subtotalEl.textContent = 'Subtotal: ';

        const subtotalValor = document.createElement('SPAN');
        subtotalValor.classList.add('fw-normal');
        subtotalValor.textContent = calcularSubtotal(precio, cantidad);

        // boton eliminar
        const btnEliminar = document.createElement('BUTTON');
        btnEliminar.classList.add('btn', 'btn-danger');
        btnEliminar.textContent = 'Eliminar del Pedido';

        // funcion para eliminar del pedido
        btnEliminar.onclick = function () {
            eliminarProducto(id);
        }

        //agregar valores a sus contenedores
        cantidadEl.appendChild(cantidadValor);
        precioEl.appendChild(precioValor);
        subtotalEl.appendChild(subtotalValor);


        // agregar elementos al li
        lista.appendChild(nombreEl);
        lista.appendChild(cantidadEl);
        lista.appendChild(precioEl);
        lista.appendChild(subtotalEl);
        lista.appendChild(btnEliminar);


        // agregar lista al grupo principal
        grupo.appendChild(lista);

    } );


    // agregar al contenido
    resumen.appendChild(heading);
    resumen.appendChild(fecha);
    resumen.appendChild(hora);
    resumen.appendChild(grupo);

    contenido.appendChild(resumen);

    // mostrar formulario de propinas
    formularioPropinas();
}

function limpiarHTML() {
    const contenido = document.querySelector('#resumen .contenido');

    while ( contenido.firstChild ) {
        contenido.removeChild(contenido.firstChild);
    }
}

function calcularSubtotal(precio, cantidad) {
    return `S/. ${precio * cantidad }`;
}

function eliminarProducto(id) {
    const { pedido } = cliente;
    const resultado = pedido.filter( articulo => articulo.id !== id );
    cliente.pedido = [...resultado];

    // limpiar el codigo html previo
    limpiarHTML();

    if( cliente.pedido.length ) {
        // mostrar el resumen
        actualizarResumen();
    } else {
        mensajePedidoVacio();
    }

    // EL PRODUCTO SE ELIMINÓ, POR LO TANTO REGRESAMOS LA CANTIDAD A 0 EN EL FORMULARIO
    const productoEliminado = `#producto-${id}`;
    const inputEliminado = document.querySelector(productoEliminado);
    inputEliminado.value = 0;
}

function mensajePedidoVacio() {
    const contenido = document.querySelector('#resumen .contenido');
    
    const texto = document.createElement('P');
    texto.classList.add('text-center', 'text-white');
    texto.textContent = 'Añade los elementos del pedido';

    contenido.appendChild(texto);
}

function formularioPropinas() {
    const contenido = document.querySelector('#resumen .contenido');

    const formulario = document.createElement('DIV');
    formulario.classList.add('col-md-6', 'formulario');

    const divFormulario = document.createElement('DIV');
    divFormulario.classList.add('card', 'py-2', 'px-3', 'shadow', 'text-black');

    const heading = document.createElement('H3');
    heading.classList.add('my-4', 'text-center');
    heading.textContent = 'Propina';

    // Radio Button 10 % 
    const radio10 = document.createElement('INPUT');
    radio10.type = 'radio';
    radio10.name = 'propina';
    radio10.value = "10";
    radio10.classList.add('form-check-input');
    radio10.onclick = calcularPropina;

    const radio10Label = document.createElement('LABEL');
    radio10Label.textContent = '10%';
    radio10Label.classList.add('form-check-label');

    const radio10Div = document.createElement('DIV');
    radio10Div.classList.add('form-check');

    radio10Div.appendChild(radio10);
    radio10Div.appendChild(radio10Label);

    // Radio Button 25 % 
    const radio25 = document.createElement('INPUT');
    radio25.type = 'radio';
    radio25.name = 'propina';
    radio25.value = "25";
    radio25.classList.add('form-check-input');
    radio25.onclick = calcularPropina;

    const radio25Label = document.createElement('LABEL');
    radio25Label.textContent = '25%';
    radio25Label.classList.add('form-check-label');

    const radio25Div = document.createElement('DIV');
    radio25Div.classList.add('form-check');

    radio25Div.appendChild(radio25);
    radio25Div.appendChild(radio25Label);

    // Radio Button 50 % 
    const radio50 = document.createElement('INPUT');
    radio50.type = 'radio';
    radio50.name = 'propina';
    radio50.value = "50";
    radio50.classList.add('form-check-input');
    radio50.onclick = calcularPropina;

    const radio50Label = document.createElement('LABEL');
    radio50Label.textContent = '50%';
    radio50Label.classList.add('form-check-label');

    const radio50Div = document.createElement('DIV');
    radio50Div.classList.add('form-check');

    radio50Div.appendChild(radio50);
    radio50Div.appendChild(radio50Label);

    // agregar al div principal
    divFormulario.appendChild(heading);
    divFormulario.appendChild(radio10Div);
    divFormulario.appendChild(radio25Div);
    divFormulario.appendChild(radio50Div);

    // agregarlo al formulario
    formulario.appendChild(divFormulario);

    contenido.appendChild(formulario);
}
function mostrarBoton() {
    
}

function calcularPropina() {
    const { pedido } = cliente;
    let subtotal = 0;
    //calcular el subtotal a pagar
    pedido.forEach( articulo => {
        subtotal += articulo.cantidad * articulo.precio;
    });
    // seleccionar el radio button
    const propinaSeleccionada = document.querySelector('[name="propina"]:checked').value;

    // calcular la propina
    const propina = ((subtotal * parseInt( propinaSeleccionada )) / 100 );

    // calcular el total a pagar
    const total = subtotal + propina;
    

    mostrarTotalHTML( subtotal.toFixed(2), total.toFixed(2), propina.toFixed(2) );
}

function mostrarTotalHTML( subtotal, total, propina ) {
    const divTotales = document.createElement('DIV');
    divTotales.classList.add('total-pagar');

    //subtotal
    const subtotalParrafo = document.createElement('P');
    subtotalParrafo.classList.add('fs-4', 'fw-bold', 'mt-3');
    subtotalParrafo.textContent = 'Subtotal Consumo: ';

    const subtotalSpan = document.createElement('SPAN');
    subtotalSpan.classList.add('fw-normal');
    subtotalSpan.textContent = `S/.${subtotal}`;

    subtotalParrafo.appendChild(subtotalSpan);

    //Propina
    const propinaParrafo = document.createElement('P');
    propinaParrafo.classList.add('fs-4', 'fw-bold', 'mt-3');
    propinaParrafo.textContent = 'Propina Consumo: ';

    const propinaSpan = document.createElement('SPAN');
    propinaSpan.classList.add('fw-normal');
    propinaSpan.textContent = `S/.${propina}`;

    propinaParrafo.appendChild(propinaSpan);

    //Total
    const totalParrafo = document.createElement('P');
    totalParrafo.classList.add('fs-4', 'fw-bold', 'mt-3');
    totalParrafo.textContent = 'Total Consumo: ';

    const totalSpan = document.createElement('SPAN');
    totalSpan.classList.add('fw-normal');
    totalSpan.textContent = `S/.${total}`;

    totalParrafo.appendChild(totalSpan);

    const btnPagar = document.createElement('BUTTON');
    btnPagar.classList.add('btn', 'btn-danger', 'left');
    btnPagar.textContent = 'Realizar Pedido';

    // eliminar el ultimo resultado
    const totalpagarDiv = document.querySelector('.total-pagar');
    if (totalpagarDiv) {
        totalpagarDiv.remove();
    }

    divTotales.appendChild(subtotalParrafo);
    divTotales.appendChild(propinaParrafo);
    divTotales.appendChild(totalParrafo);
    divTotales.appendChild(btnPagar);
    
    
    const formulario = document.querySelector('.formulario > div ');
    formulario.appendChild(divTotales);
    
}

function dateFormat(inputDate, format) {
    //parse the input date
    const date = new Date(inputDate);

    //extract the parts of the date
    const day = date.getDate() + 1;
    const month = date.getMonth() + 1;
    const year = date.getFullYear();    

    //replace the month
    format = format.replace("MM", month.toString().padStart(2,"0"));        

    //replace the year
    if (format.indexOf("yyyy") > -1) {
        format = format.replace("yyyy", year.toString());
    } else if (format.indexOf("yy") > -1) {
        format = format.replace("yy", year.toString().substr(2,2));
    }

    //replace the day
    format = format.replace("dd", day.toString().padStart(2,"0"));

    return format;
}
