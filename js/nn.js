// класа Activation,
// прави активатор од имена и функције
export class Activation {
  constructor(name, func) {
    this.name = name;
    this.func = func;
  }

  // функција activate прима скалар
  // враћа активацију
  activate(z) {
    return this.func(z);
  }
}

// класа Neuron
// прави неурон од num_inputs и Activation класе
// насумично генерише почетне вредности за
// основу и тежину
export class Neuron {
  constructor(activation, num_inputs) {
    this.num_inputs = num_inputs;
    this.activation = activation;
    this.weights = [];
    this.basis = Math.random() - 0.5; // насумична иницијализација у опсегу [-0.5, 0.5]

    for (
      let i = 0;
      i < num_inputs;
      i++ // насумична иницијализација свих тежина [-0.5, 0.5]
    )
      this.weights[i] = Math.random() - 0.5;
  }

  // calcZ прима улазне активације (низ скалара),
  // и рачуна суму производа тежина и улазних неурона
  calcZ(inputs) {
    if (inputs.length != this.weights.length) return;

    let z = this.basis;
    for (let i = 0; i < this.weights.length; i++)
      z += this.weights[i] * inputs[i];

    return z;
  }

  // calcA рачуна активацију неурона
  calcA(inputs) {
    if (inputs.length != this.weights.length) return;

    return this.activation.activate(this.calcZ(inputs));
  }

  mutacija(sansa, snaga) {
    if (Math.random() < sansa / 100) {
        let mut = [];
        for (let i = 0; i < this.weights.length; i++) {
            const factor = (Math.random() - 0.5) * snaga;
            this.weights[i] += factor;
            mut[i] = factor;
        }
        const basisMut = (Math.random() - 0.5) * snaga;
        this.basis += basisMut;
        console.log(`Мутација W: ${mut}\nМутација b: ${basisMut}`);
    }
  }

  // str враћа ниску која описује неурон
  str() {
    return `Неурон:
    \tАктивација: ${this.activation.name}
    \tТежине: ${this.weights}\n\tОснова: ${this.basis}`;
  }

}

// класа NeuralNetworkLayer
// представља слој неуронске мреже
// прима низ неурона и број улаза као параметре
export class NeuralNetworkLayer {

  constructor(neurons, num_inputs) {
    this.num_inputs = num_inputs;
    this.neurons = neurons;
  }

  calcZ(activations) {
    let Z = [];

    for (let i = 0; i < this.num_inputs; i++) {
      Z[i] = this.neurons[i].calcZ(activations);
    }

    return Z;
  }

  calcA(activations) {
    let A = [];

    for (let i = 0; i < this.neurons.length; i++) {
      A[i] = this.neurons[i].calcA(activations);
    }

    return A;
  }

  mutacija(sansa, snaga) {
    for (let i = 0; i < this.neurons.length; i++)
        this.neurons[i].mutacija(sansa, snaga);
  }

  str() {
    let s = "Слој:\n";
    for (let index = 0; index < this.neurons.length; index++)
        s += this.neurons[index].str() + "\n";
    return s;
  }

}

// класа NeuralNetwork
// представља целу неуронску мрежу
// прима низ слојева као конструктор
export class NeuralNetwork {

    constructor(layers) {
        this.layers = layers;
    }

    calcA(initial_inputs) {
        let cur_activation = initial_inputs;

        for (let i = 0; i < this.layers.length; i++) {
            const element = this.layers[i];

            cur_activation = element.calcA(cur_activation);
        }

        return cur_activation;
    }

    str() {
        let s = "";
        for (let index = 0; index < this.layers.length; index++)
            s += this.layers[index].str() + "\n";
        return s;
    }
    
    mutacija(sansa, snaga) {
        for (let i = 0; i < this.layers.length; i++)
            this.layers[i].mutacija(sansa, snaga);
    }

}

// функција brziLayer
// прима активацију, број неурона и број улаза
// враћа слој са одговарајућим параметрима
export function brziLayer(activation, num_neurons, num_inputs) {
    let neurons = []
    for (let i = 0; i < num_neurons; i++) {
        neurons[i] = new Neuron(activation, num_inputs);
    }
    return new NeuralNetworkLayer(neurons, num_inputs);
}