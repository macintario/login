class ValidadorCLABE {
    // Bancos y sus códigos (ejemplos comunes)
    static bancos = {
        '002': 'BANAMEX',
        '012': 'BBVA BANCOMER',
        '014': 'SANTANDER',
        '019': 'BANJERCITO',
        '021': 'HSBC',
        '030': 'BANCO DEL BAJIO',
        '032': 'WIKIBANCO (SUCURSAL FICTICIA)',
        '036': 'INBURSA',
        '037': 'INTERACCIONES',
        '042': 'MIFEL',
        '044': 'SCOTIABANK',
        '058': 'BANREGIO',
        '059': 'INVEX',
        '060': 'BANSI',
        '062': 'AFIRME',
        '072': 'BANORTE',
        '127': 'AZTECA',
        '137': 'BANCOPPEL'
    };

    // Validar formato básico de CLABE (18 dígitos numéricos)
    static validarFormato(clabe) {
        return /^\d{18}$/.test(clabe);
    }

    // Validar banco (primeros 3 dígitos)
    static validarBanco(clabe) {
        const codigoBanco = clabe.substring(0, 3);
        return this.bancos.hasOwnProperty(codigoBanco);
    }

    // Obtener nombre del banco
    static obtenerBanco(clabe) {
        const codigoBanco = clabe.substring(0, 3);
        return this.bancos[codigoBanco] || 'Banco no reconocido';
    }

    // Validar dígito de control (algoritmo módulo 10)
    static validarDigitoControl(clabe) {
//        console.log('Validando dígito de control para CLABE:', clabe); 
        if (clabe.length !== 18) return false;

        const digitoControl = parseInt(clabe[17], 10);
        const primeros17 = clabe.substring(0, 17);

        let suma = 0;

        for (let i = 0; i < 17; i++) {
            let digito = parseInt(primeros17[i], 10);
//console.log(`Dígito ${i + 1}: ${digito}`);
            // Aplicar ponderación: posición 1,3,5... se multiplican por 3
            // posición 2,4,6... se multiplican por 7
            // posición 7,8,9... se multiplican por 1
            let ponderacion;

            if (i % 3 === 0) { // Posiciones 1,4,7,10,13,16
                ponderacion = 3;
            } else if (i % 3 === 1) { // Posiciones 2,5,8,11,14,17
                ponderacion = 7;
            } else { // Posiciones 3,6,9,12,15
                ponderacion = 1;
            }

            let producto = digito * ponderacion;
//            console.log(`  Ponderación: ${ponderacion}, Producto: ${producto}`);
            // sumar los últimos dígitos del producto
            suma += producto % 10;
            //console.log(`  Suma parcial: ${suma}`);
        }

        const digitoCalculado = (10 - (suma % 10)) % 10;
//        console.log(`Dígito calculado: ${digitoCalculado}, Dígito de control: ${digitoControl}`);
        return digitoCalculado === digitoControl;
    }

    // Validación completa de CLABE
    static validarCLABE(clabe) {

        // Limpiar espacios y caracteres no numéricos
        const clabeLimpia = clabe.replace(/^[\\s]+|[\\s]+$/g, '');

        if (!this.validarFormato(clabeLimpia)) {
            return {
                valida: false,
                error: 'Formato inválido. La CLABE debe tener 18 dígitos numéricos.'
            };
        }

        if (!this.validarBanco(clabeLimpia)) {
            return {
                valida: false,
                error: 'Banco no reconocido.'
            };
        }

        if (!this.validarDigitoControl(clabeLimpia)) {
            return {
                valida: false,
                error: 'Dígito de control inválido.'
            };
        }

        return {
            valida: true,
            banco: this.obtenerBanco(clabeLimpia),
            clabe: clabeLimpia
        };
    }
}
// Función de uso práctico
function validarCLABE(clabe) {
    console.log('Validando CLABE:', clabe);
    return ValidadorCLABE.validarCLABE(clabe);
}
// Ejemplos de uso
//console.log(validarCLABE('012180004123456789')); // CLABE válida de BBVA
//console.log(validarCLABE('012180004123456780')); // CLABE inválida (dígito control erróneo)
//console.log(validarCLABE('0121800041234567'));   // CLABE muy corta
//console.log(validarCLABE('0121800041234567890')); // CLABE muy larga
//console.log(validarCLABE('abc012180004123456789')); // CLABE con caracteres no numéricos
// Función para usar en formularios HTML
function validarCLABEInput(inputId) {
    const input = document.getElementById(inputId);
    const resultado = validarCLABE(input.value);

    if (resultado.valida) {
        alert(`CLABE válida - Banco: ${resultado.banco}`);
        return true;
    } else {
        alert(`CLABE inválida: ${resultado.error}`);
        input.focus();
        return false;
    }
}
